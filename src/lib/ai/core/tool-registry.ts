import { Tool, ToolDefinition, ToolExecutor } from '../../../types/tools';

/**
 * Registry for all available AI tools
 */
class ToolRegistry {
  private tools: Record<string, Tool> = {};

  /**
   * Register a new tool
   */
  registerTool(name: string, definition: ToolDefinition, executor: ToolExecutor): void {
    console.log(`🔧 TOOL-REGISTRY: Registering tool '${name}'`, {
      type: definition.type,
      parameters: definition.parameters ? Object.keys(definition.parameters.properties || {}) : [],
      required: definition.parameters?.required || [],
      additionalProps: definition.parameters?.additionalProperties
    });
    
    this.tools[name] = {
      definition,
      executor
    };
    
    console.log(`✅ TOOL-REGISTRY: Tool '${name}' registered successfully`);
  }

  /**
   * Get a specific tool by name
   */
  getTool(name: string): Tool | undefined {
    return this.tools[name];
  }

  /**
   * Get all registered tools
   */
  getAllTools(): Record<string, Tool> {
    return this.tools;
  }

  /**
   * Get all tool definitions for OpenAI API
   */
  getAllDefinitions(): ToolDefinition[] {
    const definitions = Object.values(this.tools).map(tool => tool.definition);
    console.log(`🧰 TOOL-REGISTRY: Providing ${definitions.length} tool definitions:`, 
      definitions.map(d => d.name));
    
    // Deep check each tool definition for required OpenAI Responses API properties
    definitions.forEach(def => {
      if (!def.type) {
        console.warn(`⚠️ TOOL-REGISTRY: Tool '${def.name}' missing 'type' property`);
      }
      
      if (!def.parameters?.additionalProperties === false) {
        console.warn(`⚠️ TOOL-REGISTRY: Tool '${def.name}' missing 'additionalProperties: false'`);
      }
      
      // Check if there are nested objects in parameters that might need additionalProperties: false
      if (def.parameters?.properties) {
        Object.entries(def.parameters.properties).forEach(([propName, propValue]) => {
          if (propValue && typeof propValue === 'object' && (propValue as any).type === 'object') {
            if ((propValue as any).additionalProperties !== false) {
              console.warn(`⚠️ TOOL-REGISTRY: Tool '${def.name}' has nested object '${propName}' without additionalProperties: false`);
            }
          }
        });
      }
    });
    
    return definitions;
  }

  /**
   * Execute a tool by name with given arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    console.log(`🔍 TOOL-REGISTRY: Looking for tool '${name}'`);
    const tool = this.getTool(name);
    
    if (!tool) {
      console.error(`❌ TOOL-REGISTRY: Tool '${name}' not found`);  
      console.log(`🔎 TOOL-REGISTRY: Available tools:`, Object.keys(this.tools));
      throw new Error(`Tool not found: ${name}`);
    }
    
    console.log(`🚀 TOOL-REGISTRY: Executing tool '${name}' with args:`, args);
    
    // Validate the args against the expected parameters
    const definition = tool.definition;
    if (definition.parameters?.required) {
      const missingRequiredArgs = definition.parameters.required
        .filter((param: string) => !(param in args));
        
      if (missingRequiredArgs.length > 0) {
        console.warn(`⚠️ TOOL-REGISTRY: Missing required args for tool '${name}':`, missingRequiredArgs);
      }
    }
    
    try {
      const result = await tool.executor(args);
      console.log(`✅ TOOL-REGISTRY: Tool '${name}' executed successfully with result:`, result);
      return result;
    } catch (error: unknown) {
      console.error(`❌ TOOL-REGISTRY: Error executing tool '${name}':`, error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const toolRegistry = new ToolRegistry();

// Export utility functions for registering tools
export function registerTool(name: string, definition: ToolDefinition, executor: ToolExecutor): void {
  toolRegistry.registerTool(name, definition, executor);
}
