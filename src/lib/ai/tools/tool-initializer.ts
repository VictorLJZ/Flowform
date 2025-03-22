/**
 * Tool Initializer
 * 
 * This file handles the initialization of AI tools during application startup.
 * It ensures all tools are properly registered with the ToolRegistry.
 */

import { toolRegistry } from '../core/tool-registry';
import { availableTools } from './index';

// Function to initialize and register all tools
export function initializeTools() {
  console.log('🔧 INITIALIZING TOOLS');
  
  // Count of registered tools
  let registeredCount = 0;
  
  // Register each tool from the availableTools map
  Object.entries(availableTools).forEach(([toolName, tool]) => {
    console.log(`📥 Registering tool: ${toolName}`);
    
    // Register the tool with the registry
    toolRegistry.registerTool(
      tool.definition.name, 
      tool.definition, 
      tool.executor
    );
    
    registeredCount++;
  });
  
  console.log(`✅ TOOL INITIALIZATION COMPLETE: ${registeredCount} tools registered`);
  
  // Return the registry for testing purposes
  return toolRegistry;
}

// Export a singleton instance of the registry after initialization
export const initializedToolRegistry = initializeTools();
