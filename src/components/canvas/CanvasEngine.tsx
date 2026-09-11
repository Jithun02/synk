'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Point, CanvasObject } from '../../types/canvas';
import { Lock, MessageSquare } from 'lucide-react';
import { synkWS } from '../../lib/websocket';

export const CanvasEngine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    objects,
    selectedObjectIds,
    activeTool,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    strokeStyle,
    fontSize,
    polygonSides,
    zoom,
    panOffset,
    gridSnap,
    gridSize,
    currentUser,
    collaborationUsers,
    simulatingMultiUser,
    comments,
    securityIssues,
    setPanOffset,
    setZoom,
    setSelectedObjectIds,
    addObject,
    updateObject,
    deleteObjects,
    lockObject,
    focusObject,
    addComment,
  } = useCanvasStore();

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [currentPenPoints, setCurrentPenPoints] = useState<Point[]>([]);
  const [connectorStartObjId, setConnectorStartObjId] = useState<string | null>(null);
  const [snapGuides, setSnapGuides] = useState<{ type: 'h' | 'v'; pos: number }[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        setIsSpacePressed(true);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedObjectIds, deleteObjects, setSelectedObjectIds } = useCanvasStore.getState();
        if (selectedObjectIds.length > 0) {
          deleteObjects(selectedObjectIds);
          setSelectedObjectIds([]);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Multi-laptop Real-Time Synchronization Engine
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const join = params.get('join');
    const urlName = params.get('userName');
    const urlRole = params.get('userRole');
    const urlRoom = params.get('room') || 'synk_cloud_8H72KD';

    if (urlName && (join === 'true' || urlName)) {
      const colors = ['#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#3b82f6'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const initials = urlName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
      const userId = `user_${urlName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(Math.random() * 1000)}`;

      useCanvasStore.setState({
        roomCode: urlRoom,
        currentUser: {
          id: userId,
          name: urlName,
          role: (urlRole as any) || 'editor',
          color,
          avatar: initials,
          cursor: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
          activeTool: 'select',
          selectedObjectIds: [],
          isOnline: true,
        },
      });
    }

    const { roomCode, currentUser } = useCanvasStore.getState();

    // 1. Connect to Real-time SSE / PubSub engine
    synkWS.connect(roomCode, currentUser);

    // 2. Load existing room objects from host snapshot
    synkWS.fetchSnapshot(roomCode).then((remoteObjects) => {
      if (remoteObjects && Object.keys(remoteObjects).length > 0) {
        useCanvasStore.setState((s) => ({
          objects: { ...s.objects, ...remoteObjects },
        }));
      }
    });

    // 3. Listen to incoming real-time events from other laptops
    const unsubscribe = synkWS.subscribe((msg) => {
      const state = useCanvasStore.getState();
      const myUserId = state.currentUser.id;

      if (msg.type === 'PRESENCE_HEARTBEAT') {
        if (msg.user && msg.user.id !== myUserId) {
          useCanvasStore.setState((s) => ({
            collaborationUsers: {
              ...s.collaborationUsers,
              [msg.user.id]: {
                ...msg.user,
                isOnline: true,
                lastSeen: Date.now(),
              },
            },
          }));
        }
      } else if (msg.type === 'CURSOR_MOVE') {
        if (msg.userId !== myUserId) {
          useCanvasStore.setState((s) => {
            const existing = s.collaborationUsers[msg.userId] || {
              id: msg.userId,
              name: msg.userName || 'Teammate',
              color: msg.color || '#3b82f6',
              avatar: (msg.userName || 'T').slice(0, 2).toUpperCase(),
              role: 'editor',
              activeTool: 'select',
              selectedObjectIds: [],
              isOnline: true,
            };
            return {
              collaborationUsers: {
                ...s.collaborationUsers,
                [msg.userId]: {
                  ...existing,
                  cursor: msg.cursor,
                  isOnline: true,
                  lastSeen: Date.now(),
                },
              },
            };
          });
        }
      } else if (msg.type === 'OBJECT_CREATE') {
        if (msg.userId !== myUserId && msg.object) {
          useCanvasStore.setState((s) => ({
            objects: { ...s.objects, [msg.object.id]: msg.object },
          }));
        }
      } else if (msg.type === 'OBJECT_UPDATE') {
        if (msg.userId !== myUserId && msg.objectId && msg.updates) {
          useCanvasStore.setState((s) => {
            const target = s.objects[msg.objectId];
            if (!target) return s;
            return {
              objects: {
                ...s.objects,
                [msg.objectId]: { ...target, ...msg.updates, updatedAt: Date.now() },
              },
            };
          });
        }
      } else if (msg.type === 'OBJECT_DELETE') {
        if (msg.userId !== myUserId && msg.objectIds) {
          useCanvasStore.setState((s) => {
            const nextObj = { ...s.objects };
            msg.objectIds.forEach((id) => delete nextObj[id]);
            return { objects: nextObj };
          });
        }
      } else if (msg.type === 'FULL_SNAPSHOT') {
        if (msg.objects) {
          useCanvasStore.setState({ objects: msg.objects });
        }
      }
    });

    // 4. Periodically check offline users (stale heartbeats > 12s)
    const offlineInterval = setInterval(() => {
      const now = Date.now();
      useCanvasStore.setState((s) => {
        let changed = false;
        const updatedUsers = { ...s.collaborationUsers };
        Object.keys(updatedUsers).forEach((uid) => {
          const u = updatedUsers[uid] as any;
          if (u.lastSeen && now - u.lastSeen > 12000 && u.isOnline) {
            updatedUsers[uid] = { ...u, isOnline: false };
            changed = true;
          }
        });
        return changed ? { collaborationUsers: updatedUsers } : s;
      });
    }, 4000);

    // 5. Periodically publish workspace snapshot to cloud for new joiners
    const snapshotInterval = setInterval(() => {
      const { objects, roomCode } = useCanvasStore.getState();
      synkWS.publishSnapshot(objects, roomCode);
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(offlineInterval);
      clearInterval(snapshotInterval);
    };
  }, []);

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      if (!containerRef.current) return { x: screenX, y: screenY };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (screenX - rect.left - panOffset.x) / zoom;
      const y = (screenY - rect.top - panOffset.y) / zoom;
      return { x, y };
    },
    [panOffset, zoom]
  );

  const snapValue = useCallback(
    (val: number): number => {
      if (!gridSnap) return val;
      return Math.round(val / gridSize) * gridSize;
    },
    [gridSnap, gridSize]
  );

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Dot Grid Background (synk style)
    if (gridSnap) {
      ctx.fillStyle = '#cbd5e1';
      const startX = Math.floor((-panOffset.x / zoom) / gridSize) * gridSize;
      const endX = startX + (canvas.width / zoom) + gridSize;
      const startY = Math.floor((-panOffset.y / zoom) / gridSize) * gridSize;
      const endY = startY + (canvas.height / zoom) + gridSize;

      for (let x = startX; x < endX; x += gridSize) {
        for (let y = startY; y < endY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2 / zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const objList = Object.values(objects);
    
    // Draw Connectors / Arrows First (behind cards)
    for (const obj of objList) {
      if (obj.type === 'connector' || obj.type === 'arrow' || obj.type === 'line') {
        ctx.save();
        ctx.globalAlpha = obj.opacity ?? 1;

        let startX = obj.x;
        let startY = obj.y;
        let endX = obj.x + obj.width;
        let endY = obj.y + obj.height;

        if (obj.fromObjectId && objects[obj.fromObjectId] && obj.toObjectId && objects[obj.toObjectId]) {
          const fromNode = objects[obj.fromObjectId];
          const toNode = objects[obj.toObjectId];
          startX = fromNode.x + fromNode.width;
          startY = fromNode.y + fromNode.height / 2;
          endX = toNode.x;
          endY = toNode.y + toNode.height / 2;
        }

        ctx.strokeStyle = obj.strokeColor || '#818cf8';
        ctx.lineWidth = (obj.strokeWidth || 2) / zoom;
        ctx.fillStyle = obj.strokeColor || '#818cf8';

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        // Smooth Bezier Curve if connecting cards horizontally/vertically
        const dx = endX - startX;
        const cp1x = startX + dx * 0.5;
        const cp1y = startY;
        const cp2x = startX + dx * 0.5;
        const cp2y = endY;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        ctx.stroke();

        // Arrow Head
        const angle = Math.atan2(endY - cp2y, endX - cp2x);
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    // Draw Cards, Shapes, Text & Sticky Notes
    for (const obj of objList) {
      if (obj.type === 'connector' || obj.type === 'arrow' || obj.type === 'line') continue;

      ctx.save();
      ctx.globalAlpha = obj.opacity ?? 1;

      const isSelected = selectedObjectIds.includes(obj.id);
      const hasSecIssue = securityIssues.some((s) => s.objectId === obj.id);

      if (obj.type === 'rectangle' && obj.categoryTag) {
        // synk System Architecture Card
        const r = 12;
        ctx.beginPath();
        ctx.roundRect(obj.x, obj.y, obj.width, obj.height, r);

        // Drop shadow for card
        ctx.shadowColor = 'rgba(15, 23, 42, 0.06)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Reset shadow for border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = isSelected ? '#6366f1' : hasSecIssue ? '#ef4444' : obj.strokeColor || '#e2e8f0';
        ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.stroke();

        // Top Green Status Dot
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width - 16, obj.y + 16, 3, 0, Math.PI * 2);
        ctx.fill();

        // Top Category Tag (e.g. ENTRY POINT)
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText((obj.categoryTag || '').toUpperCase(), obj.x + 48, obj.y + 18);

        // Left Icon Container (Pastel Box)
        const iconBgColor =
          obj.categoryTag === 'ENTRY POINT'
            ? '#f0f9ff'
            : obj.categoryTag === 'EDGE LAYER'
            ? '#e0e7ff'
            : obj.categoryTag === 'APPLICATION'
            ? '#dcfce7'
            : obj.categoryTag === 'DATA'
            ? '#f3e8ff'
            : '#fef3c7';

        const iconColor =
          obj.categoryTag === 'ENTRY POINT'
            ? '#0284c7'
            : obj.categoryTag === 'EDGE LAYER'
            ? '#4f46e5'
            : obj.categoryTag === 'APPLICATION'
            ? '#16a34a'
            : obj.categoryTag === 'DATA'
            ? '#9333ea'
            : '#d97706';

        ctx.fillStyle = iconBgColor;
        ctx.beginPath();
        ctx.roundRect(obj.x + 14, obj.y + 32, 28, 28, 6);
        ctx.fill();

        // Icon Graphic
        ctx.fillStyle = iconColor;
        ctx.beginPath();
        ctx.arc(obj.x + 28, obj.y + 46, 5, 0, Math.PI * 2);
        ctx.fill();

        // Card Title (e.g. Customer app, API gateway)
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(obj.text || '', obj.x + 48, obj.y + 32);

        // Card Subtitle (e.g. Web & mobile clients)
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(obj.subtitle || '', obj.x + 48, obj.y + 50);

        // Active User Editing Tag Badge (e.g., "Alice is editing")
        if (obj.activeUserEditing) {
          const badgeText = obj.activeUserEditing.name;
          ctx.fillStyle = obj.activeUserEditing.color || '#ea580c';
          ctx.beginPath();
          ctx.roundRect(obj.x + 30, obj.y + obj.height + 4, 90, 20, 6);
          ctx.fill();

          // Tail pointer triangle
          ctx.beginPath();
          ctx.moveTo(obj.x + 45, obj.y + obj.height);
          ctx.lineTo(obj.x + 40, obj.y + obj.height + 5);
          ctx.lineTo(obj.x + 50, obj.y + obj.height + 5);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, obj.x + 75, obj.y + obj.height + 14);
        }
      } else if (obj.type === 'sticky') {
        // SynkDraw Sticky Note
        ctx.shadowColor = 'rgba(217, 119, 6, 0.12)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = obj.fillColor || '#fef9c3';
        ctx.beginPath();
        ctx.roundRect(obj.x, obj.y, obj.width, obj.height, 8);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Note Text with Word Wrapping & Clean Alignment
        if (obj.text) {
          ctx.fillStyle = '#78350f';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          const maxTextWidth = obj.width - 32;
          const rawLines = obj.text.split('\n');
          let currentY = obj.y + 16;

          for (let i = 0; i < rawLines.length; i++) {
            const rawLine = rawLines[i];
            if (!rawLine.trim()) {
              currentY += 10;
              continue;
            }

            // Title line bold, body lines medium
            if (i === 0) {
              ctx.font = 'bold 12px Inter, sans-serif';
              ctx.fillStyle = '#78350f';
            } else {
              ctx.font = '500 11px Inter, sans-serif';
              ctx.fillStyle = '#92400e';
            }

            const words = rawLine.split(' ');
            let currentLineText = '';

            for (let w = 0; w < words.length; w++) {
              const testText = currentLineText ? `${currentLineText} ${words[w]}` : words[w];
              const metrics = ctx.measureText(testText);

              if (metrics.width > maxTextWidth && currentLineText !== '') {
                ctx.fillText(currentLineText, obj.x + 16, currentY);
                currentY += 16;
                currentLineText = words[w];
              } else {
                currentLineText = testText;
              }
            }

            if (currentLineText) {
              ctx.fillText(currentLineText, obj.x + 16, currentY);
              currentY += 18;
            }
          }
        }

        // Bottom Arrow Icon (↗)
        ctx.fillStyle = '#b45309';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('↗', obj.x + obj.width - 12, obj.y + obj.height - 10);
      } else if (obj.type === 'rectangle' || obj.type === 'circle' || obj.type === 'polygon') {
        // General Shapes
        ctx.fillStyle = obj.fillColor || '#ffffff';
        ctx.strokeStyle = obj.strokeColor || '#cbd5e1';
        ctx.lineWidth = obj.strokeWidth || 1.5;

        if (obj.type === 'rectangle') {
          ctx.beginPath();
          ctx.roundRect(obj.x, obj.y, obj.width, obj.height, 8);
          ctx.fill();
          ctx.stroke();
        } else if (obj.type === 'circle') {
          ctx.beginPath();
          ctx.ellipse(
            obj.x + obj.width / 2,
            obj.y + obj.height / 2,
            Math.abs(obj.width / 2),
            Math.abs(obj.height / 2),
            0,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();
        }

        if (obj.text) {
          ctx.fillStyle = '#0f172a';
          ctx.font = `${obj.fontSize || 14}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obj.text, obj.x + obj.width / 2, obj.y + obj.height / 2);
        }
      } else if (obj.type === 'pen' || obj.type === 'pencil' || obj.type === 'brush') {
        if (obj.points && obj.points.length > 0) {
          ctx.strokeStyle = obj.strokeColor || '#6366f1';
          ctx.lineWidth = obj.strokeWidth || 2;
          ctx.beginPath();
          ctx.moveTo(obj.points[0].x, obj.points[0].y);
          for (let i = 1; i < obj.points.length; i++) {
            ctx.lineTo(obj.points[i].x, obj.points[i].y);
          }
          ctx.stroke();
        }
      } else if (obj.type === 'text') {
        ctx.fillStyle = obj.strokeColor || '#0f172a';
        ctx.font = `${obj.fontSize || 16}px Inter, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(obj.text || 'Text', obj.x, obj.y);
      }

      // Selected Object Handles
      if (isSelected) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5 / zoom;
        ctx.strokeRect(obj.x - 2, obj.y - 2, obj.width + 4, obj.height + 4);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;

        // 8 handles (4 corners + 4 sides)
        const handles = [
          { x: obj.x - 2, y: obj.y - 2 },
          { x: obj.x + obj.width / 2, y: obj.y - 2 },
          { x: obj.x + obj.width + 2, y: obj.y - 2 },
          { x: obj.x - 2, y: obj.y + obj.height / 2 },
          { x: obj.x + obj.width + 2, y: obj.y + obj.height / 2 },
          { x: obj.x - 2, y: obj.y + obj.height + 2 },
          { x: obj.x + obj.width / 2, y: obj.y + obj.height + 2 },
          { x: obj.x + obj.width + 2, y: obj.y + obj.height + 2 },
        ];

        for (const h of handles) {
          ctx.beginPath();
          ctx.arc(h.x, h.y, 3.5 / zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    if (currentPenPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(currentPenPoints[0].x, currentPenPoints[0].y);
      for (let i = 1; i < currentPenPoints.length; i++) {
        ctx.lineTo(currentPenPoints[i].x, currentPenPoints[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (isMouseDown && startPoint && currentPoint && activeTool !== 'select' && activeTool !== 'pan') {
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([4, 4]);

      const w = currentPoint.x - startPoint.x;
      const h = currentPoint.y - startPoint.y;

      if (activeTool === 'rectangle' || activeTool === 'sticky') {
        ctx.strokeRect(startPoint.x, startPoint.y, w, h);
      } else if (activeTool === 'circle') {
        ctx.beginPath();
        ctx.ellipse(
          startPoint.x + w / 2,
          startPoint.y + h / 2,
          Math.abs(w / 2),
          Math.abs(h / 2),
          0,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      } else if (activeTool === 'line' || activeTool === 'arrow' || activeTool === 'connector') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    for (const guide of snapGuides) {
      ctx.save();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      if (guide.type === 'h') {
        ctx.moveTo(-10000, guide.pos);
        ctx.lineTo(10000, guide.pos);
      } else {
        ctx.moveTo(guide.pos, -10000);
        ctx.lineTo(guide.pos, 10000);
      }
      ctx.stroke();
      ctx.restore();
    }

    // SynkDraw Remote User Cursors & Presence Tags
    const demoCursors = [
      { x: 670, y: 440, name: 'Maya', color: '#7c3aed' },
      { x: 500, y: 270, name: '3', isNumberBadge: true, color: '#ef4444' },
    ];

    const activeRemoteUsers = Object.values(collaborationUsers).filter(
      (u) => u.id !== currentUser.id && u.isOnline && u.cursor
    );

    const cursorList = activeRemoteUsers.length > 0
      ? activeRemoteUsers.map((u) => ({
          x: u.cursor.x,
          y: u.cursor.y,
          name: u.name.split(' ')[0],
          color: u.color || '#7c3aed',
        }))
      : (simulatingMultiUser ? Object.values(collaborationUsers).map((u) => ({
          x: u.cursor.x,
          y: u.cursor.y,
          name: u.name.split(' ')[0],
          color: u.color || '#7c3aed',
        })) : demoCursors);

    for (const c of cursorList) {
      ctx.save();
      ctx.fillStyle = c.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      if ((c as any).isNumberBadge) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('3', c.x, c.y);
      } else {
        // Pointer arrow icon
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + 12, c.y + 12);
        ctx.lineTo(c.x + 4, c.y + 14);
        ctx.lineTo(c.x, c.y + 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label Badge
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.roundRect(c.x + 10, c.y + 12, 45, 18, 5);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.name, c.x + 32.5, c.y + 21);
      }

      ctx.restore();
    }

    ctx.restore();
  }, [
    objects,
    selectedObjectIds,
    activeTool,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    strokeStyle,
    fontSize,
    polygonSides,
    zoom,
    panOffset,
    gridSnap,
    gridSize,
    snapGuides,
    currentPenPoints,
    isMouseDown,
    startPoint,
    currentPoint,
    simulatingMultiUser,
    collaborationUsers,
    securityIssues,
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        drawCanvas();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const pt = screenToCanvas(e.clientX, e.clientY);
    setIsMouseDown(true);
    setStartPoint(pt);
    setCurrentPoint(pt);

    if (activeTool === 'pan' || isSpacePressed || e.button === 1) {
      return;
    }

    if (activeTool === 'comment') {
      const text = prompt('Enter contextual comment for this canvas point:');
      if (text) {
        addComment(pt.x, pt.y, text);
      }
      setIsMouseDown(false);
      return;
    }

    if (activeTool === 'select') {
      const objList = Object.values(objects).reverse();
      const clicked = objList.find(
        (o) => pt.x >= o.x && pt.x <= o.x + o.width && pt.y >= o.y && pt.y <= o.y + o.height
      );

      if (clicked) {
        setSelectedObjectIds([clicked.id]);
        setDraggedObjectId(clicked.id);
        setDragOffset({ x: pt.x - clicked.x, y: pt.y - clicked.y });
      } else {
        setSelectedObjectIds([]);
      }
      return;
    }

    if (activeTool === 'pen' || activeTool === 'pencil' || activeTool === 'brush' || activeTool === 'highlighter') {
      setCurrentPenPoints([pt]);
      return;
    }

    if (activeTool === 'connector') {
      const objList = Object.values(objects).reverse();
      const clicked = objList.find(
        (o) => pt.x >= o.x && pt.x <= o.x + o.width && pt.y >= o.y && pt.y <= o.y + o.height
      );
      if (clicked) {
        setConnectorStartObjId(clicked.id);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pt = screenToCanvas(e.clientX, e.clientY);
    setCurrentPoint(pt);

    synkWS.send({
      type: 'CURSOR_MOVE',
      cursor: pt,
      userId: currentUser.id,
      userName: currentUser.name,
      color: currentUser.color || '#3b82f6',
    });

    if (isMouseDown && (activeTool === 'pan' || isSpacePressed || e.buttons === 4)) {
      setPanOffset((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
      return;
    }

    if (isMouseDown && draggedObjectId && activeTool === 'select') {
      const newX = snapValue(pt.x - dragOffset.x);
      const newY = snapValue(pt.y - dragOffset.y);

      const guides: { type: 'h' | 'v'; pos: number }[] = [];
      for (const objId in objects) {
        if (objId === draggedObjectId) continue;
        const other = objects[objId];
        if (Math.abs(other.x - newX) < 10) guides.push({ type: 'v', pos: other.x });
        if (Math.abs(other.y - newY) < 10) guides.push({ type: 'h', pos: other.y });
      }
      setSnapGuides(guides);
      updateObject(draggedObjectId, { x: newX, y: newY });
      return;
    }

    if (isMouseDown && (activeTool === 'pen' || activeTool === 'pencil' || activeTool === 'brush' || activeTool === 'highlighter')) {
      setCurrentPenPoints((prev) => [...prev, pt]);
      return;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !startPoint || !currentPoint) {
      setIsMouseDown(false);
      setSnapGuides([]);
      return;
    }

    setIsMouseDown(false);
    setSnapGuides([]);
    setDraggedObjectId(null);

    const pt = screenToCanvas(e.clientX, e.clientY);

    if (activeTool === 'pen' || activeTool === 'pencil' || activeTool === 'brush' || activeTool === 'highlighter') {
      if (currentPenPoints.length > 1) {
        const xs = currentPenPoints.map((p) => p.x);
        const ys = currentPenPoints.map((p) => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);

        addObject({
          type: activeTool,
          x: minX,
          y: minY,
          width: maxX - minX || 20,
          height: maxY - minY || 20,
          rotation: 0,
          strokeColor,
          fillColor: 'transparent',
          strokeWidth: activeTool === 'brush' ? strokeWidth * 2 : strokeWidth,
          opacity: activeTool === 'highlighter' ? 0.4 : opacity,
          strokeStyle,
          points: currentPenPoints,
        });
      }
      setCurrentPenPoints([]);
      return;
    }

    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'sticky' || activeTool === 'polygon') {
      const w = snapValue(Math.abs(pt.x - startPoint.x));
      const h = snapValue(Math.abs(pt.y - startPoint.y));
      if (w > 10 && h > 10) {
        const x = snapValue(Math.min(startPoint.x, pt.x));
        const y = snapValue(Math.min(startPoint.y, pt.y));
        const textLabel = activeTool === 'sticky' ? 'New Sticky Note' : activeTool.toUpperCase();

        addObject({
          type: activeTool,
          x,
          y,
          width: w,
          height: h,
          rotation: 0,
          strokeColor,
          fillColor: activeTool === 'sticky' ? '#fef08a' : fillColor,
          strokeWidth,
          opacity,
          strokeStyle,
          text: textLabel,
          fontSize,
          polygonSides,
        });
      }
      return;
    }

    if (activeTool === 'line' || activeTool === 'arrow') {
      const w = pt.x - startPoint.x;
      const h = pt.y - startPoint.y;
      if (Math.hypot(w, h) > 10) {
        addObject({
          type: activeTool,
          x: snapValue(startPoint.x),
          y: snapValue(startPoint.y),
          width: snapValue(w),
          height: snapValue(h),
          rotation: 0,
          strokeColor,
          fillColor: strokeColor,
          strokeWidth,
          opacity,
          strokeStyle,
        });
      }
      return;
    }

    if (activeTool === 'connector' && connectorStartObjId) {
      const objList = Object.values(objects).reverse();
      const endObj = objList.find(
        (o) => pt.x >= o.x && pt.x <= o.x + o.width && pt.y >= o.y && pt.y <= o.y + o.height
      );
      const startObj = objects[connectorStartObjId];

      if (startObj && endObj && startObj.id !== endObj.id) {
        const startX = startObj.x + startObj.width / 2;
        const startY = startObj.y + startObj.height / 2;
        const endX = endObj.x + endObj.width / 2;
        const endY = endObj.y + endObj.height / 2;

        addObject({
          type: 'connector',
          x: startX,
          y: startY,
          width: endX - startX,
          height: endY - startY,
          rotation: 0,
          strokeColor,
          fillColor: 'transparent',
          strokeWidth: 2,
          opacity: 1,
          strokeStyle: 'solid',
          text: 'connects',
          fontSize: 12,
          fromObjectId: startObj.id,
          toObjectId: endObj.id,
          semanticRole: 'arrow_dependency',
        });
      }
      setConnectorStartObjId(null);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.1), 10));
    } else {
      setPanOffset((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const pt = screenToCanvas(e.clientX, e.clientY);
    const objList = Object.values(objects).reverse();
    const clicked = objList.find(
      (o) => o.type !== 'connector' && pt.x >= o.x && pt.x <= o.x + o.width && pt.y >= o.y && pt.y <= o.y + o.height
    );
    if (clicked) {
      const newTitle = prompt('Edit Title / Label:', clicked.text || '');
      if (newTitle !== null) {
        updateObject(clicked.id, { text: newTitle });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-slate-50 select-none ${
        activeTool === 'pan' || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      <div className="absolute inset-0 pointer-events-none">
        {Object.values(objects).map((obj) => {
          if (!obj.locked) return null;
          const screenX = obj.x * zoom + panOffset.x;
          const screenY = obj.y * zoom + panOffset.y;
          return (
            <div
              key={`lock_${obj.id}`}
              style={{ left: screenX, top: screenY }}
              className="absolute p-1 bg-amber-500 text-white rounded-full shadow-md -translate-x-3 -translate-y-3 pointer-events-auto"
              title="Locked Object"
            >
              <Lock size={12} />
            </div>
          );
        })}

        {comments.map((comment) => {
          if (comment.resolved) return null;
          const screenX = comment.x * zoom + panOffset.x;
          const screenY = comment.y * zoom + panOffset.y;
          return (
            <div
              key={comment.id}
              style={{ left: screenX, top: screenY }}
              className="absolute flex items-center justify-center w-7 h-7 bg-blue-600 text-white font-bold text-xs rounded-full shadow-lg border-2 border-white -translate-x-3.5 -translate-y-3.5 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
              onClick={() => {
                const reply = prompt(`Comment thread by ${comment.userName}: "${comment.text}"\n\nEnter reply:`);
                if (reply) {
                  useCanvasStore.getState().replyComment(comment.id, reply);
                }
              }}
              title={`${comment.userName}: ${comment.text}`}
            >
              <MessageSquare size={14} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
