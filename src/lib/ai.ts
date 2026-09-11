import { CanvasObject, SecurityIssue, Point } from '../types/canvas';

export class AICanvasAgent {
  static generateDiagramFromPrompt(prompt: string, startX = 120, startY = 180): CanvasObject[] {
    const lower = prompt.toLowerCase();
    const now = Date.now();

    // 1. Healthcare / HIPAA Pipeline
    if (lower.includes('hipaa') || lower.includes('health') || lower.includes('patient') || lower.includes('ehr')) {
      const patient: CanvasObject = {
        id: `ai_node_1_${now}`,
        type: 'rectangle',
        x: startX,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#059669',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Patient Portal',
        categoryTag: 'HIPAA INGRESS',
        subtitle: 'Telehealth Video & Chat',
        iconName: 'LayoutGrid',
        semanticRole: 'gateway',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const proxy: CanvasObject = {
        id: `ai_node_2_${now}`,
        type: 'rectangle',
        x: startX + 260,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#2563eb',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'BAA Gateway',
        categoryTag: 'ZERO TRUST PROXY',
        subtitle: 'AES-256 GCM Ingress',
        iconName: 'Shield',
        semanticRole: 'gateway',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const ehr: CanvasObject = {
        id: `ai_node_3_${now}`,
        type: 'rectangle',
        x: startX + 520,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#7c3aed',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'EHR PHI Vault',
        categoryTag: 'ENCRYPTED PHI',
        subtitle: 'FHIR v4.0 Schema',
        iconName: 'Database',
        semanticRole: 'database',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const audit: CanvasObject = {
        id: `ai_node_4_${now}`,
        type: 'rectangle',
        x: startX + 780,
        y: startY - 80,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#dc2626',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'HIPAA Audit Trail',
        categoryTag: 'IMMUTABLE AUDIT',
        subtitle: 'WORM Encrypted Ledger',
        iconName: 'Shield',
        semanticRole: 'service',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const diagAi: CanvasObject = {
        id: `ai_node_5_${now}`,
        type: 'rectangle',
        x: startX + 780,
        y: startY + 80,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#059669',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Diagnostic AI Model',
        categoryTag: 'ANONYMIZED ML',
        subtitle: 'De-identified Radiography',
        iconName: 'Sparkles',
        semanticRole: 'service',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const note: CanvasObject = {
        id: `ai_note_${now}`,
        type: 'sticky',
        x: startX,
        y: startY + 140,
        width: 200,
        height: 140,
        rotation: 0,
        strokeColor: '#fef08a',
        fillColor: '#fef9c3',
        strokeWidth: 1,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'PHI Anonymization\n\nStrip SSN & DOBs before routing to Diagnostic AI model.',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn1: CanvasObject = {
        id: `ai_c1_${now}`,
        type: 'connector',
        x: patient.x + patient.width,
        y: patient.y + patient.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#059669',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: patient.id,
        toObjectId: proxy.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn2: CanvasObject = {
        id: `ai_c2_${now}`,
        type: 'connector',
        x: proxy.x + proxy.width,
        y: proxy.y + proxy.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#2563eb',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: proxy.id,
        toObjectId: ehr.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn3: CanvasObject = {
        id: `ai_c3_${now}`,
        type: 'connector',
        x: ehr.x + ehr.width,
        y: ehr.y + ehr.height / 2,
        width: 60,
        height: -80,
        rotation: 0,
        strokeColor: '#7c3aed',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: ehr.id,
        toObjectId: audit.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn4: CanvasObject = {
        id: `ai_c4_${now}`,
        type: 'connector',
        x: ehr.x + ehr.width,
        y: ehr.y + ehr.height / 2,
        width: 60,
        height: 80,
        rotation: 0,
        strokeColor: '#7c3aed',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: ehr.id,
        toObjectId: diagAi.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      return [patient, proxy, ehr, audit, diagAi, note, conn1, conn2, conn3, conn4];
    }

    // 2. AWS Cloud Infrastructure / Serverless
    if (lower.includes('aws') || lower.includes('cloud') || lower.includes('serverless') || lower.includes('lambda')) {
      const cdn: CanvasObject = {
        id: `ai_node_1_${now}`,
        type: 'rectangle',
        x: startX,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#ea580c',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'AWS CloudFront',
        categoryTag: 'EDGE CDN',
        subtitle: 'Global Edge Caching',
        iconName: 'Globe',
        semanticRole: 'gateway',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const gw: CanvasObject = {
        id: `ai_node_2_${now}`,
        type: 'rectangle',
        x: startX + 260,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#0284c7',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'AWS API Gateway',
        categoryTag: 'REST INGRESS',
        subtitle: 'Throttling & Auth',
        iconName: 'Command',
        semanticRole: 'gateway',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const lambda: CanvasObject = {
        id: `ai_node_3_${now}`,
        type: 'rectangle',
        x: startX + 520,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#d97706',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Lambda Functions',
        categoryTag: 'SERVERLESS COMPUTE',
        subtitle: 'Node.js Runtime',
        iconName: 'Cpu',
        semanticRole: 'service',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const dynamo: CanvasObject = {
        id: `ai_node_4_${now}`,
        type: 'rectangle',
        x: startX + 780,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#2563eb',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'DynamoDB Table',
        categoryTag: 'NOSQL DATABASE',
        subtitle: 'On-Demand Capacity',
        iconName: 'Database',
        semanticRole: 'database',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn1: CanvasObject = {
        id: `ai_c1_${now}`,
        type: 'connector',
        x: cdn.x + cdn.width,
        y: cdn.y + cdn.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#ea580c',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: cdn.id,
        toObjectId: gw.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn2: CanvasObject = {
        id: `ai_c2_${now}`,
        type: 'connector',
        x: gw.x + gw.width,
        y: gw.y + gw.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#0284c7',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: gw.id,
        toObjectId: lambda.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn3: CanvasObject = {
        id: `ai_c3_${now}`,
        type: 'connector',
        x: lambda.x + lambda.width,
        y: lambda.y + lambda.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#d97706',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: lambda.id,
        toObjectId: dynamo.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      return [cdn, gw, lambda, dynamo, conn1, conn2, conn3];
    }

    // 3. Kubernetes / K8s Deployment
    if (lower.includes('kubernetes') || lower.includes('k8s') || lower.includes('cluster') || lower.includes('istio')) {
      const ingress: CanvasObject = {
        id: `ai_node_1_${now}`,
        type: 'rectangle',
        x: startX,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#3b82f6',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Nginx Ingress',
        categoryTag: 'K8S INGRESS',
        subtitle: 'TLS Termination',
        iconName: 'Server',
        semanticRole: 'gateway',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const mesh: CanvasObject = {
        id: `ai_node_2_${now}`,
        type: 'rectangle',
        x: startX + 260,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#6366f1',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Istio Service Mesh',
        categoryTag: 'MTLS PROXY',
        subtitle: 'Envoy Sidecars',
        iconName: 'Shield',
        semanticRole: 'gateway',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const appSvc: CanvasObject = {
        id: `ai_node_3_${now}`,
        type: 'rectangle',
        x: startX + 520,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#10b981',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Order Pods (v2.4)',
        categoryTag: 'K8S DEPLOYMENT',
        subtitle: '3 Replicas HPA',
        iconName: 'Cpu',
        semanticRole: 'service',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const redis: CanvasObject = {
        id: `ai_node_4_${now}`,
        type: 'rectangle',
        x: startX + 780,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#ef4444',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Redis StatefulSet',
        categoryTag: 'CACHE CLUSTER',
        subtitle: 'In-Memory Cache',
        iconName: 'Database',
        semanticRole: 'cache',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn1: CanvasObject = {
        id: `ai_c1_${now}`,
        type: 'connector',
        x: ingress.x + ingress.width,
        y: ingress.y + ingress.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#3b82f6',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: ingress.id,
        toObjectId: mesh.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn2: CanvasObject = {
        id: `ai_c2_${now}`,
        type: 'connector',
        x: mesh.x + mesh.width,
        y: mesh.y + mesh.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#6366f1',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: mesh.id,
        toObjectId: appSvc.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn3: CanvasObject = {
        id: `ai_c3_${now}`,
        type: 'connector',
        x: appSvc.x + appSvc.width,
        y: appSvc.y + appSvc.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#10b981',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: appSvc.id,
        toObjectId: redis.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      return [ingress, mesh, appSvc, redis, conn1, conn2, conn3];
    }

    // 4. Fintech / Payment Gateway / Banking
    if (lower.includes('fintech') || lower.includes('payment') || lower.includes('bank') || lower.includes('card')) {
      const client: CanvasObject = {
        id: `ai_node_1_${now}`,
        type: 'rectangle',
        x: startX,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#0284c7',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Mobile Banking App',
        categoryTag: 'FINTECH CLIENT',
        subtitle: 'Biometric Auth',
        iconName: 'LayoutGrid',
        semanticRole: 'ui_component',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const pci: CanvasObject = {
        id: `ai_node_2_${now}`,
        type: 'rectangle',
        x: startX + 260,
        y: startY,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#4f46e5',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'PCI-DSS Gateway',
        categoryTag: 'TOKENIZATION',
        subtitle: 'Card Token Vault',
        iconName: 'Shield',
        semanticRole: 'gateway',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const fraud: CanvasObject = {
        id: `ai_node_3_${now}`,
        type: 'rectangle',
        x: startX + 520,
        y: startY - 80,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#b91c1c',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Fraud Detection Engine',
        categoryTag: 'REAL-TIME ML',
        subtitle: 'Risk Score < 0.05',
        iconName: 'Sparkles',
        semanticRole: 'service',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const ledger: CanvasObject = {
        id: `ai_node_4_${now}`,
        type: 'rectangle',
        x: startX + 520,
        y: startY + 80,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#059669',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Core Ledger Service',
        categoryTag: 'TRANSACTION ENGINE',
        subtitle: 'Double-Entry Accounting',
        iconName: 'Database',
        semanticRole: 'service',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const db: CanvasObject = {
        id: `ai_node_5_${now}`,
        type: 'rectangle',
        x: startX + 780,
        y: startY + 80,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#047857',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Postgres ACIDs Ledger',
        categoryTag: 'IMMUTABLE DB',
        subtitle: 'HA Primary/Replica',
        iconName: 'Database',
        semanticRole: 'database',
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn1: CanvasObject = {
        id: `ai_c1_${now}`,
        type: 'connector',
        x: client.x + client.width,
        y: client.y + client.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#0284c7',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: client.id,
        toObjectId: pci.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn2: CanvasObject = {
        id: `ai_c2_${now}`,
        type: 'connector',
        x: pci.x + pci.width,
        y: pci.y + pci.height / 2,
        width: 60,
        height: -80,
        rotation: 0,
        strokeColor: '#4f46e5',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: pci.id,
        toObjectId: fraud.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn3: CanvasObject = {
        id: `ai_c3_${now}`,
        type: 'connector',
        x: pci.x + pci.width,
        y: pci.y + pci.height / 2,
        width: 60,
        height: 80,
        rotation: 0,
        strokeColor: '#4f46e5',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: pci.id,
        toObjectId: ledger.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const conn4: CanvasObject = {
        id: `ai_c4_${now}`,
        type: 'connector',
        x: ledger.x + ledger.width,
        y: ledger.y + ledger.height / 2,
        width: 60,
        height: 0,
        rotation: 0,
        strokeColor: '#059669',
        fillColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        fromObjectId: ledger.id,
        toObjectId: db.id,
        ownerId: 'ai_agent',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      return [client, pci, fraud, ledger, db, conn1, conn2, conn3, conn4];
    }

    // 5. Dynamic Parser for Any Custom Prompt Text
    // Extract key entities mentioned in the prompt text
    const cleanPrompt = prompt.replace(/[^\w\s,-]/gi, '');
    const tokens = cleanPrompt.split(/[,;\n\.]|and|with|to|for/).map((t) => t.trim()).filter((t) => t.length > 2);

    if (tokens.length >= 2) {
      const generatedObjects: CanvasObject[] = [];
      const nodes: CanvasObject[] = [];

      tokens.slice(0, 5).forEach((token, idx) => {
        const role =
          token.toLowerCase().includes('db') || token.toLowerCase().includes('database') || token.toLowerCase().includes('sql')
            ? 'database'
            : token.toLowerCase().includes('auth') || token.toLowerCase().includes('security') || token.toLowerCase().includes('proxy')
            ? 'gateway'
            : 'service';

        const stroke =
          role === 'database' ? '#9333ea' : role === 'gateway' ? '#4f46e5' : '#0284c7';

        const node: CanvasObject = {
          id: `ai_custom_${idx}_${now}`,
          type: 'rectangle',
          x: startX + idx * 240,
          y: startY + (idx % 2 === 1 ? 50 : 0),
          width: 200,
          height: 100,
          rotation: 0,
          strokeColor: stroke,
          fillColor: '#ffffff',
          strokeWidth: 2,
          opacity: 1,
          strokeStyle: 'solid',
          text: token.charAt(0).toUpperCase() + token.slice(1),
          categoryTag: role.toUpperCase(),
          subtitle: `AI Generated Node`,
          iconName: role === 'database' ? 'Database' : role === 'gateway' ? 'Shield' : 'Cpu',
          semanticRole: role as any,
          ownerId: 'ai_agent',
          createdAt: now,
          updatedAt: now,
          version: 1,
        };

        nodes.push(node);
        generatedObjects.push(node);
      });

      // Add connectors between consecutive dynamic nodes
      for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i];
        const to = nodes[i + 1];
        const conn: CanvasObject = {
          id: `ai_conn_dyn_${i}_${now}`,
          type: 'connector',
          x: from.x + from.width,
          y: from.y + from.height / 2,
          width: to.x - (from.x + from.width),
          height: to.y - from.y,
          rotation: 0,
          strokeColor: '#6366f1',
          fillColor: 'transparent',
          strokeWidth: 2,
          opacity: 1,
          strokeStyle: 'solid',
          fromObjectId: from.id,
          toObjectId: to.id,
          ownerId: 'ai_agent',
          createdAt: now,
          updatedAt: now,
          version: 1,
        };
        generatedObjects.push(conn);
      }

      return generatedObjects;
    }

    // Default Fallback Microservices Stack
    const client: CanvasObject = {
      id: `ai_client_${now}`,
      type: 'rectangle',
      x: startX,
      y: startY,
      width: 200,
      height: 100,
      rotation: 0,
      strokeColor: '#e2e8f0',
      fillColor: '#ffffff',
      strokeWidth: 1.5,
      opacity: 1,
      strokeStyle: 'solid',
      text: 'Customer App',
      categoryTag: 'ENTRY POINT',
      subtitle: 'Web & mobile clients',
      iconName: 'LayoutGrid',
      semanticRole: 'ui_component',
      ownerId: 'ai_agent',
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const gateway: CanvasObject = {
      id: `ai_gw_${now}`,
      type: 'rectangle',
      x: startX + 260,
      y: startY,
      width: 200,
      height: 100,
      rotation: 0,
      strokeColor: '#818cf8',
      fillColor: '#ffffff',
      strokeWidth: 2,
      opacity: 1,
      strokeStyle: 'solid',
      text: 'API Gateway',
      categoryTag: 'EDGE LAYER',
      subtitle: 'Authentication · Routing',
      iconName: 'Command',
      semanticRole: 'gateway',
      ownerId: 'ai_agent',
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const service: CanvasObject = {
      id: `ai_service_${now}`,
      type: 'rectangle',
      x: startX + 520,
      y: startY,
      width: 200,
      height: 100,
      rotation: 0,
      strokeColor: '#10b981',
      fillColor: '#ffffff',
      strokeWidth: 1.5,
      opacity: 1,
      strokeStyle: 'solid',
      text: 'Core Microservice',
      categoryTag: 'APPLICATION',
      subtitle: 'Business logic',
      iconName: 'Cpu',
      semanticRole: 'service',
      ownerId: 'ai_agent',
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const db: CanvasObject = {
      id: `ai_db_${now}`,
      type: 'rectangle',
      x: startX + 780,
      y: startY,
      width: 200,
      height: 100,
      rotation: 0,
      strokeColor: '#3b82f6',
      fillColor: '#ffffff',
      strokeWidth: 1.5,
      opacity: 1,
      strokeStyle: 'solid',
      text: 'PostgreSQL DB',
      categoryTag: 'DATA',
      subtitle: 'Relational persistence',
      iconName: 'Database',
      semanticRole: 'database',
      ownerId: 'ai_agent',
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const conn1: CanvasObject = {
      id: `ai_conn_1_${now}`,
      type: 'connector',
      x: client.x + client.width,
      y: client.y + client.height / 2,
      width: 60,
      height: 0,
      rotation: 0,
      strokeColor: '#818cf8',
      fillColor: 'transparent',
      strokeWidth: 2,
      opacity: 1,
      strokeStyle: 'solid',
      fromObjectId: client.id,
      toObjectId: gateway.id,
      ownerId: 'ai_agent',
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const conn2: CanvasObject = {
      id: `ai_conn_2_${now}`,
      type: 'connector',
      x: gateway.x + gateway.width,
      y: gateway.y + gateway.height / 2,
      width: 60,
      height: 0,
      rotation: 0,
      strokeColor: '#818cf8',
      fillColor: 'transparent',
      strokeWidth: 2,
      opacity: 1,
      strokeStyle: 'solid',
      fromObjectId: gateway.id,
      toObjectId: service.id,
      ownerId: 'ai_agent',
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const conn3: CanvasObject = {
      id: `ai_conn_3_${now}`,
      type: 'connector',
      x: service.x + service.width,
      y: service.y + service.height / 2,
      width: 60,
      height: 0,
      rotation: 0,
      strokeColor: '#10b981',
      fillColor: 'transparent',
      strokeWidth: 2,
      opacity: 1,
      strokeStyle: 'solid',
      fromObjectId: service.id,
      toObjectId: db.id,
      ownerId: 'ai_agent',
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    return [client, gateway, service, db, conn1, conn2, conn3];
  }

  static explainCanvas(objects: CanvasObject[]): string {
    if (objects.length === 0) {
      return 'The canvas is currently empty. Add shapes, text, or use AI generation to start.';
    }

    const services = objects.filter((o) => o.semanticRole === 'service' || o.text?.toLowerCase().includes('service'));
    const databases = objects.filter((o) => o.semanticRole === 'database' || o.text?.toLowerCase().includes('db') || o.text?.toLowerCase().includes('database'));
    const gateways = objects.filter((o) => o.semanticRole === 'gateway' || o.text?.toLowerCase().includes('gateway') || o.text?.toLowerCase().includes('client'));
    const connectors = objects.filter((o) => o.type === 'connector' || o.type === 'arrow' || o.type === 'line');

    let summary = `### 🧠 synk AI Architecture Analysis\n\n`;
    summary += `**Total Elements Detected:** ${objects.length} (${services.length} services/components, ${databases.length} database engines, ${connectors.length} connections).\n\n`;

    if (gateways.length > 0) {
      summary += `**Entry Point:** Requests enter via ${gateways.map((g) => g.text || g.type).join(', ')}.\n`;
    }
    if (services.length > 0) {
      summary += `**Core Logic:** Handled by ${services.map((s) => s.text || 'Microservice').join(' -> ')}.\n`;
    }
    if (databases.length > 0) {
      summary += `**Persistence Layer:** Data state is persisted in ${databases.map((d) => d.text || 'Database Node').join(', ')}.\n`;
    }

    summary += `\n**Key Observation:** The architecture demonstrates clear separation of concerns with ${connectors.length} active event/dependency streams.`;
    return summary;
  }

  static auditSecurity(objects: CanvasObject[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    const dbs = objects.filter((o) => o.semanticRole === 'database' || o.text?.toLowerCase().includes('db'));
    const clients = objects.filter((o) => o.semanticRole === 'ui_component' || o.text?.toLowerCase().includes('client'));
    const gateways = objects.filter((o) => o.semanticRole === 'gateway' || o.text?.toLowerCase().includes('gateway'));

    for (const db of dbs) {
      const directClients = objects.filter(
        (o) =>
          o.type === 'connector' &&
          ((o.fromObjectId === db.id && clients.some((c) => c.id === o.toObjectId)) ||
            (o.toObjectId === db.id && clients.some((c) => c.id === o.fromObjectId)))
      );
      if (directClients.length > 0) {
        issues.push({
          id: `sec_${db.id}_direct`,
          objectId: db.id,
          severity: 'critical',
          title: 'Direct Client to Database Link',
          description: `Database "${db.text || db.id}" is directly exposed to public client interface without an authentication proxy or API gateway.`,
          fixSuggestion: 'Interpose an Auth Service / API Gateway between Client and Database.',
          autoFixState: {
            strokeColor: '#ef4444',
            fillColor: '#fef2f2',
          },
        });
      }
    }

    if (dbs.length > 0 && gateways.length === 0) {
      issues.push({
        id: `sec_no_gateway`,
        objectId: dbs[0].id,
        severity: 'high',
        title: 'Missing API Security Gateway',
        description: 'The system exposes endpoints without a centralized API Gateway or WAF protection layer.',
        fixSuggestion: 'Add an API Gateway component at the top of the stack.',
      });
    }

    return issues;
  }

  static autoCleanupPenStroke(points: Point[]): {
    type: 'rectangle' | 'circle' | 'line' | 'arrow';
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    if (!points || points.length < 5) return null;

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;
    const aspectRatio = width / (height || 1);

    const start = points[0];
    const end = points[points.length - 1];
    const endDist = Math.hypot(end.x - start.x, end.y - start.y);

    if (endDist < 30) {
      if (Math.abs(aspectRatio - 1) < 0.35) {
        const size = Math.max(width, height);
        return {
          type: 'circle',
          x: minX,
          y: minY,
          width: size,
          height: size,
        };
      }
      return {
        type: 'rectangle',
        x: minX,
        y: minY,
        width,
        height,
      };
    }

    return {
      type: 'arrow',
      x: minX,
      y: minY,
      width,
      height,
    };
  }
}
