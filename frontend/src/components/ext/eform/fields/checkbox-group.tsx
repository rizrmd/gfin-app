import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { useSnapshot } from "valtio";

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
} & Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "value" | "onChange">;

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

  const handleCheckedChange = (value: string, checked: CheckboxPrimitive.CheckedState) => {
    if (mode === "object-boolean") {
      // In object-boolean mode, each option updates a different property
      write[name][value] = checked;
    } else {
      // In array mode, each option's value is added to or removed from an array
      const currentValues: string[] = Array.isArray((read as any)[name]) ? [...(read as any)[name]] : [];
      
      if (checked) {
        if (!currentValues.includes(value)) {
          const newValues = [...currentValues, value];
          write[name] = newValues;
          onChange?.(newValues);
        }
      } else {
        const newValues = currentValues.filter(v => v !== value);
        write[name] = newValues;
        onChange?.(newValues);
      }
    }
  };

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && <div className="text-sm font-medium">{label}</div>}
      <div 
        className={cn(
          layout === "vertical" ? "flex flex-col space-y-2" : "flex flex-wrap gap-4"
        )}
      >
        {options.map((option) => {
          // Determine checked state based on mode
          let isChecked: boolean;
          if (mode === "object-boolean") {
            isChecked = Boolean((read as any)[name][option.value]);
          } else {
            const values: string[] = Array.isArray((read as any)[name]) ? (read as any)[name] : [];
            isChecked = values.includes(option.value);
          }

          return (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${String(name)}-${option.value}`}
                style={{
                  border: "1px solid #ccc",
                }}
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckedChange(option.value, checked)}
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
