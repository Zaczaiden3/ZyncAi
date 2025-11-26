import { FunctionDeclaration } from "@google/genai";

// Define SchemaType locally as a helper object
const SchemaType = {
  STRING: "STRING",
  NUMBER: "NUMBER",
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  ARRAY: "ARRAY",
  OBJECT: "OBJECT"
};

export interface ToolDefinition {
  name: string;
  declaration: FunctionDeclaration;
  execute: (args: any) => Promise<any> | any;
}

// --- Tool Implementations ---

// 1. Calculator
const calculate = ({ expression }: { expression: string }) => {
  try {
    // Safety: Only allow basic math characters
    if (!/^[\d\s+\-*/().]+$/.test(expression)) {
      return "Error: Invalid characters in expression.";
    }
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${expression}`)();
    return JSON.stringify({ result });
  } catch (error) {
    return JSON.stringify({ error: "Failed to calculate expression" });
  }
};

export const calculatorTool: ToolDefinition = {
  name: "calculator",
  declaration: {
    name: "calculator",
    description: "Perform mathematical calculations. Use this for any math questions.",
    parameters: {
      type: SchemaType.OBJECT as any,
      properties: {
        expression: {
          type: SchemaType.STRING as any,
          description: "The mathematical expression to evaluate (e.g., '2 + 2 * 5').",
        },
      },
      required: ["expression"],
    },
  },
  execute: calculate,
};

// 2. Current Time & Date
const getCurrentTime = () => {
  const now = new Date();
  return JSON.stringify({
    current_time: now.toLocaleTimeString(),
    current_date: now.toLocaleDateString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

export const timeTool: ToolDefinition = {
  name: "get_current_time",
  declaration: {
    name: "get_current_time",
    description: "Get the current local time and date.",
    parameters: {
      type: SchemaType.OBJECT as any,
      properties: {},
    },
  },
  execute: getCurrentTime,
};

// 3. System Status (Mock)
const getSystemStatus = () => {
  return JSON.stringify({
    cpu_load: "12%",
    memory_usage: "45%",
    active_cores: ["Reflex", "Memory", "Neuro"],
    network_latency: "24ms",
  });
};

export const systemStatusTool: ToolDefinition = {
  name: "get_system_status",
  declaration: {
    name: "get_system_status",
    description: "Get the current status of the Zync OS system.",
    parameters: {
      type: SchemaType.OBJECT as any,
      properties: {},
    },
  },
  execute: getSystemStatus,
};

// --- Registry ---

export const availableTools: ToolDefinition[] = [
  calculatorTool,
  timeTool,
  systemStatusTool,
];

export const toolDeclarations = availableTools.map(t => t.declaration);

export const executeTool = async (name: string, args: any) => {
  const tool = availableTools.find(t => t.name === name);
  if (!tool) {
    return JSON.stringify({ error: `Tool ${name} not found.` });
  }
  try {
    return await tool.execute(args);
  } catch (e) {
    return JSON.stringify({ error: `Tool execution failed: ${e}` });
  }
};
