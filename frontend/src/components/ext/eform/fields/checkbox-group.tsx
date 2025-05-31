import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { snapshot, useSnapshot } from "valtio";
import { getNestedProperty, setNestedProperty } from "../utils";

export type CheckboxOption = {
  label: string;
  value: string;
};

type Props<
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
> = {
  name: K;
  containerClassName?: string;
  label?: string;
  options: CheckboxOption[];
  layout?: "vertical" | "horizontal";
  mode?: "array" | "object-boolean";
  onChange?: (values: string[]) => void;
} & Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  "value" | "onChange"
>;

export const CheckboxGroup = function <
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
>(
  this: { data: V },
  {
    name,
    containerClassName,
    label,
    options,
    layout = "vertical",
    mode = "array",
    onChange,
    ...rest
  }: Props<K, V>
) {
  const read = useSnapshot(this.data);
  const write = this.data as any;

  const handleCheckedChange = (
    value: string,
    checked: CheckboxPrimitive.CheckedState
  ) => {
    if (mode === "object-boolean") {
      if (value === "true") {
        setNestedProperty(write, name, checked);
      } else {
        const nameWithValue = `${String(name)}.${value}`;
        setNestedProperty(write, nameWithValue, checked);
      }
    } else {
      // In array mode, each option's value is added to or removed from an array
      const currentValues: string[] = Array.isArray(
        getNestedProperty(read, String(name))
      )
        ? [...getNestedProperty(read, String(name))]
        : [];

      if (checked) {
        if (!currentValues.includes(value)) {
          const newValues = [...currentValues, value];
          setNestedProperty(write, String(name), newValues);
          onChange?.(newValues);
        }
      } else {
        const newValues = currentValues.filter((v) => v !== value);
        setNestedProperty(write, String(name), newValues);
        onChange?.(newValues);
      }
    }
  };

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && <div className="text-sm font-medium">{label}</div>}
      <div
        className={cn(
          layout === "vertical"
            ? "flex flex-col space-y-2"
            : "flex flex-wrap gap-4"
        )}
      >
        {options.map((option) => {
          // Determine checked state based on mode
          let isChecked = false;
          try {
            if (mode === "object-boolean") {
              const nameWithValue = `${String(name)}.${option.value}`;
              if (option.value === "true") {
                isChecked = Boolean(getNestedProperty(read, name));
              } else {
                isChecked = Boolean(getNestedProperty(read, nameWithValue));
              }
            } else {
              const values: string[] = Array.isArray(
                getNestedProperty(read, String(name))
              )
                ? getNestedProperty(read, String(name))
                : [];
              isChecked = values.includes(option.value);
            }
          } catch (e) {
            isChecked = false;
          }
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${String(name)}-${option.value}`}
                style={{
                  border: "1px solid #ccc",
                }}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleCheckedChange(option.value, checked)
                }
                {...rest}
              />
              <label
                htmlFor={`${String(name)}-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
