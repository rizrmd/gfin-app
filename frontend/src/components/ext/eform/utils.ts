import { trim } from "lodash";

/**
 * Gets a nested property from an object using a path string with dot notation
 * @param obj The object to get the property from
 * @param path The path to the property using dot notation (e.g., "user.profile.name")
 * @returns The value at the specified path or undefined if not found
 */
export function getNestedProperty(obj: any, path: string): any {
  if (!path) return obj;

  const keys = trim(path, ".").split(".");
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Sets a nested property in an object using a path string with dot notation
 * @param obj The object to set the property on
 * @param path The path to the property using dot notation (e.g., "user.profile.name")
 * @param value The value to set
 */
export function setNestedProperty(obj: any, path: string, value: any): void {
  if (!path) return;

  const keys = trim(path, ".").split(".");
  let current = obj;

  // Navigate to the parent object of the property we want to set
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      current[key] === undefined ||
      current[key] === null ||
      typeof current[key] !== "object"
    ) {
      // Create an empty object if the property doesn't exist or is not an object
      current[key] = {};
    }
    current = current[key];
  }

  // Set the property on the parent object
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
}
