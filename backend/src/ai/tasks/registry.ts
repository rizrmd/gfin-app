import { registerTaskLogicProvider } from "../lib/task-main";
import {
  TASK_TYPE_SEARCH_BY_NAME_STATE,
  getSearchByNameStateCallbacksProvider,
  type SearchByNameStateInput,
  type SearchByNameStateOutput,
  type SearchByNameProgressState,
} from "./search_by_name_state";

/**
 * Initializes and registers all known AI task logic providers.
 * This function should be called once during application startup.
 */
export function initializeTaskRegistry(): void {
  // Register SearchByNameState task logic
  registerTaskLogicProvider<
    SearchByNameStateInput,
    SearchByNameStateOutput,
    SearchByNameProgressState
  >(TASK_TYPE_SEARCH_BY_NAME_STATE, getSearchByNameStateCallbacksProvider);

  console.log(
    `[TaskRegistry] Registered logic provider for task type: ${TASK_TYPE_SEARCH_BY_NAME_STATE}`
  );

  // ... Register other task logic providers here as they are created ...
  // Example:
  // import { TASK_TYPE_ANOTHER_TASK, getAnotherTaskCallbacksProvider } from "./another_task";
  // registerTaskLogicProvider(TASK_TYPE_ANOTHER_TASK, getAnotherTaskCallbacksProvider);
  // console.log(`[TaskRegistry] Registered logic provider for task type: ${TASK_TYPE_ANOTHER_TASK}`);

  console.log("[TaskRegistry] All known task logic providers registered.");
}

// Optionally, you can call initializeTaskRegistry() directly if this module is
// guaranteed to be imported only once at startup. Otherwise, export the function
// and call it from a central startup file (e.g., backend/src/index.tsx).
// For this example, we'll assume it's called from elsewhere.
// initializeTaskRegistry();
