import { proxy } from "valtio";

export type AIState = ReturnType<typeof newAIState>;
export const newAIState = () => proxy({});
