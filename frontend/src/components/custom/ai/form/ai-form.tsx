import { EForm, Field, Section } from "@/components/ext/eform";
import { useEffect, useRef } from "react";
import { AILayoutRenderer } from "./ai-layout-renderer";
import type { AIField, AIFormLayout, AIFormSection } from "./ai-form.types";

interface AIFormProps<T extends object> {
  layout: AIFormLayout[];
  value: T;
  onSubmit?: (data: T) => void | Promise<void>;
  className?: string;
  onChange?: (data: T) => void;
  disabled?: boolean;
  onInit?: (read: T, write: T) => void;
}

export const AIForm = <T extends object>({
  layout,
  value,
  onSubmit,
  className,
  onChange,
  disabled = false,
  onInit,
}: AIFormProps<T>) => {
  const previousDataRef = useRef<T>();

  // Helper function to get nested value from object
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  // Helper function to set nested value in object
  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  // Helper function to create default item for array section
  const createDefaultItem = (section: AIFormSection) => {
    const item: any = {};
    section.childs.forEach((child) => {
      // Now, TypeScript infers 'child' as AIField.
      const fieldName = child.field.split(".").pop()!; // Get the last part of the field path
      switch (child.type) {
        case "text-input":
        case "text-area":
          item[fieldName] = "";
          break;
        case "checkbox":
          if (child.mode === "array-string") {
            item[fieldName] = [];
          } else {
            item[fieldName] = {};
          }
          break;
        case "dropdown":
          item[fieldName] = "";
          break;
        default:
          item[fieldName] = "";
      }
    });
    return item;
  };

  return (
    <EForm
      data={value}
      onInit={({ read, write }) => {
        // Store initial data reference
        previousDataRef.current = JSON.parse(JSON.stringify(read));

        // Call onInit callback if provided
        if (onInit) {
          onInit(read as T, write as T);
        }
      }}
      onSubmit={async ({ write, read }) => {
        if (onSubmit) {
          await onSubmit(read as T);
        }
      }}
      className={className}
    >
      {(fieldProps) => {
        const { read, write } = fieldProps;

        // Watch for data changes and trigger onChange
        useEffect(() => {
          if (!onChange || !previousDataRef.current) return;

          const currentData = JSON.stringify(read);
          const previousData = JSON.stringify(previousDataRef.current);

          if (currentData !== previousData) {
            onChange(read as T);
            previousDataRef.current = JSON.parse(JSON.stringify(read));
          }
        });

        return (
          <>
            <AILayoutRenderer
              layout={layout}
              fieldProps={fieldProps}
              disabled={disabled}
              getNestedValue={getNestedValue}
              setNestedValue={setNestedValue}
              createDefaultItem={createDefaultItem}
            />
          </>
        );
      }}
    </EForm>
  );
};
