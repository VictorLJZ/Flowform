import { Connection, Rule } from '@/types/workflow-types';

/**
 * Preserve rules when connections are regenerated
 * This utility ensures rules are maintained across connections with matching source and target
 * which helps when connection IDs change but the actual connections remain the same
 */
export function preserveRules(connections: Connection[]): Connection[] {
  // Log original connections for debugging
  console.log('🧩🔍 [RULE_PRESERVATION] Checking connections for rule preservation:', connections.map(c => ({
    id: c.id,
    sourceId: c.sourceId,
    targetId: c.defaultTargetId,
    rulesCount: c.rules?.length || 0
  })));
  
  // Get connections with rules
  const connectionsWithRules = connections.filter(c => 
    c.rules && c.rules.length > 0
  );
  
  // If there are no rules to preserve, return original connections
  if (connectionsWithRules.length === 0) {
    console.log('🧩🔍 [RULE_PRESERVATION] No rules to preserve, using original connections');
    return connections;
  }
  
  // Create a lookup map for quick access to connections with rules
  const ruleLookup = new Map<string, Rule[]>();
  connectionsWithRules.forEach(conn => {
    // Create a key based on source and target IDs
    const key = `${conn.sourceId}->${conn.defaultTargetId}`;
    ruleLookup.set(key, conn.rules);
  });
  
  console.log(`🧩🔍 [RULE_PRESERVATION] Created rule lookup with ${ruleLookup.size} entries`);
  
  // Return enhanced connections with preserved rules
  return connections.map(conn => {
    const key = `${conn.sourceId}->${conn.defaultTargetId}`;
    const preservedRules = ruleLookup.get(key);
    
    // If this connection should have rules but doesn't, restore them
    if (preservedRules && (!conn.rules || conn.rules.length === 0)) {
      console.log(`🧩✅ [RULE_PRESERVATION] Restoring ${preservedRules.length} rules for connection ${conn.id}`);
      // Create a new connection with preserved rules
      return {
        ...conn,
        rules: preservedRules
      };
    }
    
    // Otherwise return the original connection
    return conn;
  });
}
