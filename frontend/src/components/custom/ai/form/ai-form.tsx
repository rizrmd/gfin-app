import { EForm } from "@/components/ext/eform";
import {
  getNestedProperty,
  setNestedProperty,
} from "@/components/ext/eform/utils";
import { useSnapshot } from "valtio";
import { Textarea } from "@/components/ui/textarea";
import type { AIFormLayout, AIField, AIFormSection } from "./ai-form.types";
import { Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from "react";

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

  const renderField = (field: AIField, fieldProps: any, hideLabel = false) => {
    const { Field } = fieldProps;
    const fieldLabel = hideLabel ? "" : field.title;

    switch (field.type) {
      case "text":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={fieldLabel}
            required={field.required}
            disabled={disabled}
          />
        );

      case "multi-text":
        return <Fragment key={field.field}></Fragment>;

      case "checkbox":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={fieldLabel}
            required={field.required}
            disabled={disabled}
            checkboxGroup={{
              options: field.options,
              mode: (field as any).mode || "array",
            }}
          />
        );

      case "dropdown":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={fieldLabel}
            required={field.required}
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

  const renderSection = (section: AIFormSection, fieldProps: any) => {
    const { Section } = fieldProps;
    const shouldHideLabels = section.childs.length === 1;

    return (
      <Section key={section.title} title={section.title}>
        {section.childs.map((child) =>
          renderField(child, fieldProps, shouldHideLabels)
        )}
      </Section>
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
