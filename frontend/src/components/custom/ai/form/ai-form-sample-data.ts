import type { AIFormLayout, AIField, AIFormSection } from "@/components/custom/ai/form/ai-form.types";

/**
 * Generates sample data object from AIFormLayout configuration
 * @param layout - The AIFormLayout array configuration
 * @returns Object with field names as keys and empty string values
 */
export const generateSampleDataFromLayout = (layout: AIFormLayout[]): Record<string, any> => {
  const result: Record<string, any> = {};

  const processField = (field: AIField): any => {
    switch (field.type) {
      case "text-input":
      case "text-area":
        return "";
      case "checkbox":
        if (field.mode === "array-string") {
          return [];
        } else {
          // object-boolean mode
          const checkboxData: Record<string, boolean> = {};
          field.options.forEach((option) => {
            checkboxData[option.value] = false;
          });
          return checkboxData;
        }
      case "dropdown":
        return "";
      default:
        return "";
    }
  };

  const processSection = (section: AIFormSection): any => {
    if (section.isArray) {
      // For array sections, return an empty array
      // Each item would contain the structure defined by the section's children
      return [];
    } else {
      // For regular sections, process each child field
      const sectionData: Record<string, any> = {};
      section.childs.forEach((child) => {
        // Get the field name (last part after the dot)
        const fieldName = child.field.split(".").pop() || child.field;
        sectionData[fieldName] = processField(child);
      });
      return sectionData;
    }
  };

  const setNestedValue = (obj: Record<string, any>, path: string, value: any) => {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  layout.forEach((item) => {
    if (item.type === "section") {
      // For sections, we need to handle the nested structure
      const sectionName = item.title.toLowerCase().replace(/\s+/g, "_");
      result[sectionName] = processSection(item);
    } else {
      // For direct fields, use the field name
      const fieldValue = processField(item);
      
      // Handle nested field paths (e.g., "organization.name")
      if (item.field.includes(".")) {
        setNestedValue(result, item.field, fieldValue);
      } else {
        result[item.field] = fieldValue;
      }
    }
  });

  return result;
};

/**
 * Generates sample data object from simple AIFormLayout configuration (like the example provided)
 * This is a simplified version that assumes all fields are at the root level
 * @param layout - The AIFormLayout array configuration
 * @returns Object with field names as keys and empty string values
 */
export const generateSampleData = (layout: AIFormLayout[]): Record<string, string> => {
  const result: Record<string, string> = {};

  layout.forEach((item) => {
    if (item.type === "section") {
      // For sections, extract field names from children
      item.childs.forEach((child) => {
        const fieldName = child.field.split(".").pop() || child.field;
        result[fieldName] = "";
      });
    } else {
      // For direct fields
      result[item.field] = "";
    }
  });

  return result;
};
