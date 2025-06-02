import { Button } from "@/components/ui/button";
import { Section } from "@/components/ext/eform";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { AIFieldRenderer } from "./ai-field-renderer";
import type { AIFormSection, AIField } from "./ai-form.types";
import { snapshot } from "valtio";

interface AISectionRendererProps {
  section: AIFormSection;
  fieldProps: any;
  disabled: boolean;
  getNestedValue: (obj: any, path: string) => any;
  setNestedValue: (obj: any, path: string, value: any) => void;
  createDefaultItem: (section: AIFormSection) => any;
}

export const AISectionRenderer = ({
  section,
  fieldProps,
  disabled,
  getNestedValue,
  setNestedValue,
  createDefaultItem,
}: AISectionRendererProps) => {
  const { Section: EFormSection, read, write, Field } = fieldProps;
  const SectionComponent = EFormSection || Section;
  const shouldHideLabels = section.childs.length === 1;

  if (section.isArray) {
    // Get the base field path (common prefix for all fields in this section)
    const firstField = section.childs[0]?.field;
    if (!firstField) return null;

    // Extract the array path (everything before the last dot)
    const fieldParts = firstField.split(".");
    const arrayPath = fieldParts.slice(0, -1).join(".");

    // Get current array value
    const arrayValue = arrayPath ? getNestedValue(read, arrayPath) || [] : read;

    const addItem = () => {
      const newItem = createDefaultItem(section);
      const currentArray = getNestedValue(write, arrayPath) || [];
      currentArray.push(newItem);
    };

    const removeItem = (index: number) => {
      const newArray = arrayValue.filter((_: any, i: number) => i !== index);
      setNestedValue(write, arrayPath, newArray);
    };

    const moveItem = (fromIndex: number, toIndex: number) => {
      const currentArray = getNestedValue(write, arrayPath) || [];
      const [movedItem] = currentArray.splice(fromIndex, 1);
      currentArray.splice(toIndex, 0, movedItem);
    };

    return (
      <SectionComponent key={section.title} title={section.title} noGrid>
        <div className="space-y-4">
          {arrayValue.map((item: any, index: number) => (
            <div
              key={item._id || index}
              className="border rounded-lg p-4 space-y-4 relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-sm text-gray-700">
                  {section.labelField ? (
                    item[section.labelField]
                  ) : (
                    <>
                      {section.title} #{index + 1}
                    </>
                  )}
                </h4>
                <div className="flex gap-2">
                  {section.canMove !== false && (
                    <>
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
                      {index < arrayValue.length - 1 && (
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
                    </>
                  )}
                  {section.canRemove !== false && (
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
                  )}
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
                  return (
                    <div
                      key={modifiedField.field}
                      className={cn(
                        modifiedField.width === "full" && "md:col-span-2",
                        modifiedField.width === "half" && "md:col-span-1"
                      )}
                    >
                      <AIFieldRenderer
                        field={modifiedField}
                        Field={Field}
                        hideLabel={shouldHideLabels}
                        disabled={disabled}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {section.canAdd !== false && (
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
          )}
        </div>
      </SectionComponent>
    );
  }

  return (
    <SectionComponent key={section.title} title={section.title}>
      {section.childs.map((child, index) => (
        <div
          key={`${child.field}-${index}`}
          className={cn(
            child.width === "full" && "md:col-span-2",
            child.width === "half" && "md:col-span-1"
          )}
        >
          <AIFieldRenderer
            field={child}
            Field={Field}
            hideLabel={shouldHideLabels}
            disabled={disabled}
          />
        </div>
      ))}
    </SectionComponent>
  );
};
