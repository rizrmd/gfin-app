import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { useSnapshot } from "valtio";
import { getNestedProperty, setNestedProperty } from "../utils";

type Props<
  K extends string,
  V extends Record<string, any> = Record<string, any>
> = {
  name: K;
  containerClassName?: string;
  labelClassName?: string;
  label?: string;
  message?: string;
  required?: boolean;
  value?: string;
} & React.ComponentProps<typeof CheckboxPrimitive.Root>;

export const CheckboxLabel = function <
  K extends string,
  V extends Record<string, any> = Record<string, any>
>(
  this: { data: V },
  {
    name,
    containerClassName,
    labelClassName,
    label,
    message,
    required,
    value,
    onCheckedChange,
    ...rest
  }: Props<K, V>
) {
  const read = useSnapshot(this.data);
  const write = this.data as any;

  const handleCheckedChange = (e: CheckboxPrimitive.CheckedState) => {
    if (value) {
      // Handle as part of a values array for single checkbox with value
      const currentValues: string[] = Array.isArray(getNestedProperty(read, name)) ? 
        [...getNestedProperty(read, name)] : [];
      
      if (e) {
        if (!currentValues.includes(value)) {
          setNestedProperty(write, name, [...currentValues, value]);
        }
      } else {
        setNestedProperty(write, name, currentValues.filter(v => v !== value));
      }
    } else {
      // Simple boolean checkbox
      setNestedProperty(write, name, e);
    }
    
    onCheckedChange?.(e);
  };

  // Determine checked state based on whether we're using values or boolean
  let isChecked: boolean;
  const fieldValue = getNestedProperty(read, name);
  if (value) {
    const currentValues: string[] = Array.isArray(fieldValue) ? [...fieldValue] : [];
    isChecked = currentValues.includes(value);
  } else {
    isChecked = Boolean(fieldValue);
  }

  return (
    <div className={cn("flex items-center space-x-2", containerClassName)}>
      <Checkbox
        id={value ? `${String(name)}-${value}` : String(name)}
        style={{
          border: "1px solid #ccc",
        }}
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        {...rest}
      />
      <label
        htmlFor={value ? `${String(name)}-${value}` : String(name)}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {message || label}
      </label>
    </div>
  );
};
