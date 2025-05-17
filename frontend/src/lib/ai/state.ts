import { proxy } from "valtio";
import type { ClientState } from "shared/lib/client_state";
export type AIState = ReturnType<typeof aiState>;
export const aiState = () => proxy({} as ClientState);
