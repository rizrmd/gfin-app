import { Fragment } from "react/jsx-runtime";
import { AIFieldRenderer } from "./ai-field-renderer";
import { AISectionRenderer } from "./ai-section-renderer";
import type { AIFormLayout, AIFormSection } from "./ai-form.types";

interface AILayoutRendererProps {
  layout: AIFormLayout[];
  fieldProps: any;
  disabled: boolean;
  getNestedValue: (obj: any, path: string) => any;
  setNestedValue: (obj: any, path: string, value: any) => void;
  createDefaultItem: (section: AIFormSection) => any;
}

export const AILayoutRenderer = ({
  layout,
  fieldProps,
  disabled,
  getNestedValue,
  setNestedValue,
  createDefaultItem,
}: AILayoutRendererProps) => {
  return (
    <>
      {layout.map((item, k) => {
        if (item.type === "section") {
          return (
            <AISectionRenderer
              section={item}
              key={k}
              fieldProps={fieldProps}
              disabled={disabled}
              getNestedValue={getNestedValue}
              setNestedValue={setNestedValue}
              createDefaultItem={createDefaultItem}
            />
          );
        } else {
          return (
            <AIFieldRenderer
              key={k}
              field={item}
              Field={fieldProps.Field}
              hideLabel={false}
              disabled={disabled}
            />
          );
        }
      })}
    </>
  );
};
