import { z } from "zod";
import type { AIFormLayout, AIField, AIFormSection } from "./ai-form.types";

export function convertAIFormToZod(layouts: AIFormLayout[]): z.ZodObject<any> {
  const schema: Record<string, z.ZodTypeAny> = {};

  function processField(field: AIField): z.ZodTypeAny {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "text-input":
      case "text-area":
        fieldSchema = z.string();
        break;

      case "checkbox":
        if (field.mode === "array-string") {
          fieldSchema = z.array(z.string());
        } else {
          // object-boolean mode
          const checkboxSchema: Record<string, z.ZodBoolean> = {};
          field.options.forEach((option) => {
            checkboxSchema[option.value] = z.boolean();
          });
          fieldSchema = z.object(checkboxSchema);
        }
        break;

      case "dropdown":
        const values = field.options.map((option) => option.value);
        fieldSchema = z.enum(values as [string, ...string[]]);
        break;

      default:
        fieldSchema = z.unknown();
    }

    // Apply required/optional
    if (!field.required) {
      fieldSchema = fieldSchema.optional();
    }

    fieldSchema = fieldSchema.describe(field.title || field.field);

    return fieldSchema;
  }

  function processSection(section: AIFormSection): z.ZodTypeAny {
    const sectionSchema: Record<string, z.ZodTypeAny> = {};

    section.childs.forEach((field) => {
      sectionSchema[field.field] = processField(field);
    });

    const objectSchema = z.object(sectionSchema);

    if (section.isArray) {
      return z.array(objectSchema);
    }

    return objectSchema;
  }

  layouts.forEach((layout) => {
    if (layout.type === "section") {
      schema[layout.title.toLowerCase().replace(/\s+/g, "_")] =
        processSection(layout);
    } else {
      schema[layout.field] = processField(layout);
    }
  });

  return z.object(schema);
}
