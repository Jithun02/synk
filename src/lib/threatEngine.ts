import { CanvasObject, ThreatItem, ArchitectureHealthScore, STRIDECategory } from '../types/canvas';

export function analyzeSTRIDEThreats(objects: CanvasObject[]): ThreatItem[] {
  const threats: ThreatItem[] = [];
  const nodes = objects.filter((o) => o.type === 'rectangle' || o.type === 'circle');
  const connectors = objects.filter((o) => o.type === 'connector');

  // Check 1: Ingress node directly connecting to DB without Gateway/WAF (Information Disclosure & Elevation of Privilege)
  for (const node of nodes) {
    const role = node.semanticRole || 'service';
    const text = node.text || '';

    if (role === 'database') {
      const incomingConns = connectors.filter((c) => c.toObjectId === node.id);
      for (const conn of incomingConns) {
        const sourceNode = nodes.find((n) => n.id === conn.fromObjectId);
        if (sourceNode && (sourceNode.semanticRole === 'ui_component' || sourceNode.semanticRole === 'user')) {
          threats.push({
            id: `threat_db_${node.id}_${Math.random().toString(36).substring(2, 7)}`,
            objectId: node.id,
            strideCategory: 'Information Disclosure',
            title: 'Direct Untrusted Access to Sensitive DB',
            severity: 'critical',
            description: `Client "${sourceNode.text}" directly connects to Database "${text}" bypassing API Gateway authentication boundary.`,
            mitigation: 'Insert an API Gateway or WAF with mTLS tokenization between client and DB.',
            trustBoundary: 'Public Internet ➔ Internal DMZ',
          });
        }
      }
    }

    if (role === 'gateway' && !text.toLowerCase().includes('tls') && !text.toLowerCase().includes('auth')) {
      threats.push({
        id: `threat_gw_${node.id}_${Math.random().toString(36).substring(2, 7)}`,
        objectId: node.id,
        strideCategory: 'Spoofing',
        title: 'Unauthenticated Public Endpoint',
        severity: 'high',
        description: `Gateway "${text}" lacks explicit TLS client certificate requirement or JWT validator.`,
        mitigation: 'Enforce OAuth2 PKCE / mTLS handshake at the ingress edge.',
        trustBoundary: 'Untrusted Edge ➔ Perimeter',
      });
    }

    if (role === 'cache' && text.toLowerCase().includes('redis')) {
      threats.push({
        id: `threat_cache_${node.id}_${Math.random().toString(36).substring(2, 7)}`,
        objectId: node.id,
        strideCategory: 'Denial of Service',
        title: 'Unbounded Cache Volatility',
        severity: 'medium',
        description: `In-Memory Redis store "${text}" missing failover read replicas or cluster eviction policy.`,
        mitigation: 'Provision Sentinel multi-AZ read replicas with maxmemory volatile-lru policy.',
        trustBoundary: 'Internal Service Mesh',
      });
    }

    if (role === 'service') {
      threats.push({
        id: `threat_svc_${node.id}_${Math.random().toString(36).substring(2, 7)}`,
        objectId: node.id,
        strideCategory: 'Tampering',
        title: 'Missing Immutable Audit Logging',
        severity: 'low',
        description: `Service "${text}" does not publish state mutations to WORM audit logs.`,
        mitigation: 'Integrate OpenTelemetry distributed tracing and append-only event stream.',
        trustBoundary: 'Application Runtime',
      });
    }
  }

  // Fallback threat if clean
  if (threats.length === 0) {
    threats.push({
      id: 'threat_default_1',
      objectId: nodes[0]?.id || 'node_1',
      strideCategory: 'Elevation of Privilege',
      title: 'Missing Fine-Grained ABAC Policy',
      severity: 'medium',
      description: 'Microservice tokens use coarse-grained scopes without Open Policy Agent (OPA) validation.',
      mitigation: 'Implement OPA sidecar proxy to enforce Attribute-Based Access Control.',
      trustBoundary: 'Internal Microservices',
    });
  }

  return threats;
}

export function computeArchitectureHealth(objects: CanvasObject[]): ArchitectureHealthScore {
  const nodes = objects.filter((o) => o.type === 'rectangle' || o.type === 'circle');
  const roles = nodes.map((n) => n.semanticRole || 'service');

  const hasGateway = roles.includes('gateway');
  const hasDB = roles.includes('database');
  const hasCache = roles.includes('cache');
  const hasUI = roles.includes('ui_component') || roles.includes('user');
  const hasService = roles.includes('service');

  let security = 92;
  let reliability = 88;
  let scalability = 84;
  let maintainability = 90;
  let observability = 76;
  const missingItems: string[] = [];

  if (!hasGateway) {
    security -= 15;
    missingItems.push('❌ Missing Edge API Gateway / WAF Ingress');
  }
  if (!hasCache) {
    scalability -= 12;
    missingItems.push('⚠️ Missing In-Memory Flash Cache (Redis)');
  }
  if (nodes.length < 4) {
    observability -= 10;
    missingItems.push('⚠️ Limited Microservice Observability & Tracing');
  }
  if (!hasDB) {
    reliability -= 8;
    missingItems.push('ℹ️ No Persistent Multi-AZ Database Identified');
  }

  const overall = Math.round((security + reliability + scalability + maintainability + observability) / 5);

  return {
    overall,
    security,
    reliability,
    scalability,
    maintainability,
    observability,
    missingItems,
  };
}
