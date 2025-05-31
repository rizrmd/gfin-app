export type AISession = {
  id: string;
  tools: AIClientTool[];
};

export type AIClientTool<T extends Zod.Schema = Zod.Schema> = {
  name: string;
  args: T;
  action: (args: Zod.infer<T>) => Promise<any>;
};

export const createSession = (opt: { tools: AIClientTool[] }): AISession => {
  return {
    id: "",
    tools: [],
  };
};
