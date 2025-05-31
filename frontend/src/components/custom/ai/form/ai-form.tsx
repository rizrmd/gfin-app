import { EForm } from "@/components/ext/eform";
import { getNestedProperty, setNestedProperty } from "@/components/ext/eform/utils";
import { useSnapshot } from "valtio";
import { Textarea } from "@/components/ui/textarea";
import type { AIFormLayout, AIField, AIFormSection } from "./ai-form.types";

interface AIFormProps<T extends object> {
  layout: AIFormLayout;
  value: T;
  onSubmit?: (data: T) => void | Promise<void>;
  className?: string;
  disabled?: boolean;
}

export const AIForm = <T extends object>({
  layout,
  value,
  onSubmit,
  className,
  disabled = false,
}: AIFormProps<T>) => {
  // Custom TextareaField component that integrates with EForm's data binding
  const TextareaField = <K extends string>({
    name,
    label,
    required,
    disabled,
    rows = 4,
    className: fieldClassName,
    data,
  }: {
    name: K;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
    className?: string;
    data: any;
  }) => {
    const read = useSnapshot(data);
    const write = data as any;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.currentTarget.value;
      setNestedProperty(write, name, value);
    };

    const textValue = getNestedProperty(read, name) || "";

    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Textarea
          value={textValue}
          onChange={handleChange}
          disabled={disabled}
          rows={rows}
          className={fieldClassName}
        />
      </div>
    );
  };

  const renderField = (field: AIField, fieldProps: any) => {
    const { Field } = fieldProps;
    
    switch (field.type) {
      case "text":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={field.title}
            required={field.required}
            disabled={disabled}
          />
        );
        
      case "multi-text":
        return (
          <TextareaField
            key={field.field}
            name={field.field}
            label={field.title}
            required={field.required}
            disabled={disabled}
            rows={4}
            className="min-h-[100px] resize-vertical"
            data={fieldProps.write}
          />
        );
        
      case "checkbox":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={field.title}
            required={field.required}
            disabled={disabled}
            checkboxGroup={{
              options: field.options,
              mode: (field as any).mode || "array"
            }}
          />
        );
        
      case "dropdown":
        return (
          <Field
            key={field.field}
            name={field.field}
            label={field.title}
            required={field.required}
            disabled={disabled}
            singleSelect={{
              options: field.options
            }}
          />
        );
        
      default:
        return null;
    }
  };

  const renderSection = (section: AIFormSection, fieldProps: any) => {
    const { Section } = fieldProps;
    
    return (
      <Section key={section.title} title={section.title}>
        {section.childs.map((child) => renderField(child, fieldProps))}
      </Section>
    );
  };

  const renderLayout = (layout: AIFormLayout, fieldProps: any) => {
    if (layout.type === "section") {
      return renderSection(layout, fieldProps);
    } else {
      return renderField(layout, fieldProps);
    }
  };

  return (
    <EForm
      data={value}
      onSubmit={async ({ write, read }) => {
        if (onSubmit) {
          await onSubmit(read as T);
        }
      }}
      className={className}
    >
      {(fieldProps) => {
        return renderLayout(layout, fieldProps);
      }}
    </EForm>
  );
};
