import { CanvasObject, CanvasEvent, VisualConflict } from '../types/canvas';

export class CRDTEngine {
  static mergeObjectStates(
    current: CanvasObject,
    incoming: Partial<CanvasObject>,
    incomingVersion: number
  ): CanvasObject {
    if (incomingVersion > current.version) {
      return {
        ...current,
        ...incoming,
        version: incomingVersion,
        updatedAt: Date.now(),
      };
    }
    if (incomingVersion === current.version) {
      const mergedProps: Partial<CanvasObject> = {};
      const keys = Object.keys(incoming) as (keyof CanvasObject)[];
      for (const key of keys) {
        if (incoming[key] !== undefined && current[key] === undefined) {
          (mergedProps as Record<string, unknown>)[key] = incoming[key];
        }
      }
      return {
        ...current,
        ...mergedProps,
        updatedAt: Date.now(),
      };
    }
    return current;
  }

  static detectConflict(
    objectId: string,
    userA: { userId: string; name: string; state: Partial<CanvasObject> },
    userB: { userId: string; name: string; state: Partial<CanvasObject> },
    baseState: Partial<CanvasObject>
  ): VisualConflict | null {
    const keysA = Object.keys(userA.state);
    const keysB = Object.keys(userB.state);
    const overlappingKeys = keysA.filter(
      (k) => keysB.includes(k) && userA.state[k as keyof CanvasObject] !== userB.state[k as keyof CanvasObject]
    );

    if (overlappingKeys.length > 0) {
      return {
        id: `conflict_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        objectId,
        userA,
        userB,
        baseState,
        timestamp: Date.now(),
      };
    }
    return null;
  }

  static threeWayMerge(
    base: Record<string, CanvasObject>,
    branchA: Record<string, CanvasObject>,
    branchB: Record<string, CanvasObject>
  ): {
    merged: Record<string, CanvasObject>;
    conflicts: VisualConflict[];
  } {
    const merged: Record<string, CanvasObject> = { ...base };
    const conflicts: VisualConflict[] = [];

    const allKeys = Array.from(
      new Set([...Object.keys(base), ...Object.keys(branchA), ...Object.keys(branchB)])
    );

    for (const id of allKeys) {
      const inBase = base[id];
      const inA = branchA[id];
      const inB = branchB[id];

      if (!inBase) {
        if (inA && !inB) {
          merged[id] = inA;
        } else if (!inA && inB) {
          merged[id] = inB;
        } else if (inA && inB) {
          if (JSON.stringify(inA) === JSON.stringify(inB)) {
            merged[id] = inA;
          } else {
            const conflict = this.detectConflict(
              id,
              { userId: 'branch_a', name: 'Branch A', state: inA },
              { userId: 'branch_b', name: 'Branch B', state: inB },
              {}
            );
            if (conflict) conflicts.push(conflict);
            merged[id] = inA;
          }
        }
      } else {
        const changedInA = inA && JSON.stringify(inA) !== JSON.stringify(inBase);
        const changedInB = inB && JSON.stringify(inB) !== JSON.stringify(inBase);

        if (!inA && changedInB) {
          delete merged[id];
        } else if (!inB && changedInA) {
          delete merged[id];
        } else if (changedInA && !changedInB) {
          merged[id] = inA;
        } else if (!changedInA && changedInB) {
          merged[id] = inB;
        } else if (changedInA && changedInB) {
          if (JSON.stringify(inA) === JSON.stringify(inB)) {
            merged[id] = inA;
          } else {
            const conflict = this.detectConflict(
              id,
              { userId: 'branch_a', name: 'Branch A', state: inA },
              { userId: 'branch_b', name: 'Branch B', state: inB },
              inBase
            );
            if (conflict) conflicts.push(conflict);
            merged[id] = { ...inBase, ...inA, ...inB, version: Math.max(inA.version, inB.version) + 1 };
          }
        }
      }
    }

    return { merged, conflicts };
  }
}
