import { CanvasObject } from '../types/canvas';

export function arrangeDAGLayout(
  objects: Record<string, CanvasObject>
): Record<string, CanvasObject> {
  const updated: Record<string, CanvasObject> = { ...objects };
  const nodeList = Object.values(updated).filter(
    (o) => o.type !== 'connector' && o.type !== 'arrow' && o.type !== 'line'
  );

  const level0: CanvasObject[] = []; // Entry Point / UI
  const level1: CanvasObject[] = []; // Gateway / Edge
  const level2: CanvasObject[] = []; // Microservices / Application
  const level3: CanvasObject[] = []; // Database / Cache / Data
  const levelSticky: CanvasObject[] = []; // Sticky Notes

  for (const node of nodeList) {
    if (node.type === 'sticky') {
      levelSticky.push(node);
      continue;
    }

    const role = node.semanticRole || 'service';
    const tag = (node.categoryTag || '').toUpperCase();
    const text = (node.text || '').toLowerCase();

    if (role === 'ui_component' || role === 'user' || tag.includes('ENTRY') || text.includes('client') || text.includes('user') || text.includes('app') || text.includes('portal')) {
      level0.push(node);
    } else if (role === 'gateway' || tag.includes('EDGE') || tag.includes('PROXY') || text.includes('gateway') || text.includes('proxy') || text.includes('ingress')) {
      level1.push(node);
    } else if (role === 'database' || role === 'cache' || role === 'queue' || tag.includes('DATA') || tag.includes('INTELLIGENCE') || tag.includes('DB') || text.includes('db') || text.includes('database') || text.includes('store') || text.includes('ledger') || text.includes('vault')) {
      level3.push(node);
    } else {
      level2.push(node);
    }
  }

  const levels = [level0, level1, level2, level3];
  const startX = 100;
  const levelSpacingX = 270;
  const cardWidth = 200;
  const cardHeight = 100;
  const verticalSpacing = 135;
  const startY = 160;

  levels.forEach((levelNodes, levelIdx) => {
    const x = startX + levelIdx * levelSpacingX;
    levelNodes.forEach((node, idx) => {
      const y = startY + idx * verticalSpacing;
      updated[node.id] = {
        ...node,
        x,
        y,
        width: cardWidth,
        height: cardHeight,
        categoryTag:
          node.categoryTag ||
          (levelIdx === 0
            ? 'ENTRY POINT'
            : levelIdx === 1
            ? 'EDGE LAYER'
            : levelIdx === 2
            ? 'APPLICATION'
            : 'DATA'),
      };
    });
  });

  // Position Sticky Notes neatly below the entry column without overlapping
  const stickyStartY = Math.max(340, startY + level0.length * verticalSpacing + 20);
  levelSticky.forEach((sticky, idx) => {
    updated[sticky.id] = {
      ...sticky,
      x: startX,
      y: stickyStartY + idx * 160,
      width: 200,
      height: 140,
    };
  });

  // Update Connectors to anchor cleanly to calculated card edges
  for (const objId in updated) {
    const obj = updated[objId];
    if (obj.type === 'connector' && obj.fromObjectId && obj.toObjectId) {
      const fromNode = updated[obj.fromObjectId];
      const toNode = updated[obj.toObjectId];
      if (fromNode && toNode) {
        const fromX = fromNode.x + fromNode.width;
        const fromY = fromNode.y + fromNode.height / 2;
        const toX = toNode.x;
        const toY = toNode.y + toNode.height / 2;

        updated[obj.id] = {
          ...obj,
          x: fromX,
          y: fromY,
          width: toX - fromX,
          height: toY - fromY,
        };
      }
    }
  }

  return updated;
}
