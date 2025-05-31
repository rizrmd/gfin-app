import { EForm, Field, Section } from "@/components/ext/eform";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Fragment } from "react/jsx-runtime";
import type { AIField, AIFormLayout, AIFormSection } from "./ai-form.types";

interface AIFormProps<T extends object> {
  layout: AIFormLayout[];
  value: T;
  onSubmit?: (data: T) => void | Promise<void>;
  className?: string;
  onChange?: (data: T) => void;
  disabled?: boolean;
  onInit?: (data: T) => void;
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

  const renderField = (
    field: AIField,
    fieldProps: { Field: typeof Field },
    hideLabel = false
  ) => {
    const { Field } = fieldProps;
    const fieldLabel = hideLabel ? "" : field.title;

    switch (field.type) {
      case "text-input":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={fieldLabel}
            disabled={disabled}
          />
        );

      case "text-area":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={fieldLabel}
            disabled={disabled}
            input={{
              textarea: true,
            }}
          />
        );

      case "checkbox":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={fieldLabel}
            disabled={disabled}
            checkboxGroup={{
              options: field.options,
              mode:
                field.mode === "array-string" ? "array" : field.mode || "array",
            }}
          />
        );

      case "dropdown":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={fieldLabel}
            disabled={disabled}
            singleSelect={{
              options: field.options,
            }}
          />
        );

      default:
        return null;
    }
  };

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
    const item: any = {
      _id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Unique ID for React key
    };
    section.childs.forEach((child) => {
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

  const renderSection = (section: AIFormSection, fieldProps: any) => {
    const { Section: EFormSection, read, write } = fieldProps;
    const SectionComponent = EFormSection || Section;
    const shouldHideLabels = section.childs.length === 1;

    console.log('Rendering section:', section.title, 'array:', section.isArray);

    if (section.isArray) {
      // Get the base field path (common prefix for all fields in this section)
      const firstField = section.childs[0]?.field;
      if (!firstField) return null;

      // Extract the array path (everything before the last dot)
      const fieldParts = firstField.split(".");
      const arrayPath = fieldParts.slice(0, -1).join(".");

      // Get current array value
      const arrayValue = getNestedValue(read, arrayPath) || [];
      
      // Ensure all items have unique IDs for React keys
      const arrayValueWithIds = arrayValue.map((item: any, index: number) => {
        if (!item._id) {
          item._id = `item_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return item;
      });

      const addItem = () => {
        const newItem = createDefaultItem(section);
        const newArray = [...arrayValueWithIds, newItem];
        setNestedValue(write, arrayPath, newArray);
      };

      const removeItem = (index: number) => {
        const newArray = arrayValueWithIds.filter((_: any, i: number) => i !== index);
        setNestedValue(write, arrayPath, newArray);
      };

      const moveItem = (fromIndex: number, toIndex: number) => {
        console.log('Moving item from', fromIndex, 'to', toIndex);
        const newArray = [...arrayValueWithIds];
        const [movedItem] = newArray.splice(fromIndex, 1);
        newArray.splice(toIndex, 0, movedItem);
        console.log('New array after move:', newArray.map(item => ({ _id: item._id, ...item })));
        setNestedValue(write, arrayPath, newArray);
      };

      return (
        <SectionComponent key={section.title} title={section.title} noGrid>
          <div className="space-y-4">
            {arrayValueWithIds.map((item: any, index: number) => (
              <div
                key={item._id || index}
                className="border rounded-lg p-4 space-y-4 relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-sm text-gray-700">
                    {section.title} #{index + 1}
                  </h4>
                  <div className="flex gap-2">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveItem(index, index - 1)}
                        disabled={disabled}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    )}
                    {index < arrayValueWithIds.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveItem(index, index + 1)}
                        disabled={disabled}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {section.childs.map((child) => {
                    // Modify the field path to include the array index
                    const modifiedField = {
                      ...child,
                      field: `${arrayPath}.${index}.${child.field
                        .split(".")
                        .pop()}`,
                    };
                    return renderField(
                      modifiedField,
                      fieldProps,
                      shouldHideLabels
                    );
                  })}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              disabled={disabled}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {section.title}
            </Button>
          </div>
        </SectionComponent>
      );
    }

    return (
      <SectionComponent key={section.title} title={section.title}>
        {section.childs.map((child) =>
          renderField(child, fieldProps, shouldHideLabels)
        )}
      </SectionComponent>
    );
  };

  const renderLayout = (layout: AIFormLayout[], fieldProps: any) => {
    return layout.map((item, k) => {
      if (item.type === "section") {
        return <Fragment key={k}>{renderSection(item, fieldProps)}</Fragment>;
      } else {
        return <Fragment key={k}>{renderField(item, fieldProps)}</Fragment>;
      }
    });
  };

  return (
    <EForm
      data={value}
      onInit={({ read, write }) => {
        // Store initial data reference
        previousDataRef.current = JSON.parse(JSON.stringify(read));

        // Call onInit callback if provided
        if (onInit) {
          onInit(read as T);
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

        return renderLayout(layout, fieldProps);
      }}
    </EForm>
  );
};
