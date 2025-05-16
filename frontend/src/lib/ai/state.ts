import { proxy } from "valtio";
import type { ClientState } from "shared/lib/client_state";
export type AIState = ReturnType<typeof newAIState>;
export const newAIState = () => proxy({} as ClientState);
