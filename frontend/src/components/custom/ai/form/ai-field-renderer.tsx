import type { Field } from "@/components/ext/eform";
import type { AIField } from "./ai-form.types";

interface AIFieldRendererProps {
  field: AIField;
  Field: typeof Field;
  hideLabel?: boolean;
  disabled?: boolean;
}

export const AIFieldRenderer = ({
  field,
  Field,
  hideLabel = false,
  disabled = false,
}: AIFieldRendererProps) => {
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
