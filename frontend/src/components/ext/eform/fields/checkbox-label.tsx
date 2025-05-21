import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { useSnapshot } from "valtio";

type Props<
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
> = {
  name: K;
  containerClassName?: string;
  labelClassName?: string;
  label?: string;
  message?: string;
  required?: boolean;
} & React.ComponentProps<typeof CheckboxPrimitive.Root>;

export const CheckboxLabel = function <
  K extends Exclude<keyof V, symbol | number>,
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
    onCheckedChange,
    ...rest
  }: Props<K, V>
) {
  const read = useSnapshot(this.data);
  const write = this.data as any;

  const handleCheckedChange = (e: CheckboxPrimitive.CheckedState) => {
    const value = e;
    write[name] = value;
    onCheckedChange?.(value);
  };

  const value = (read as any)[name];
  // value && console.log("checkbox", value);

  return (
    <div
      className={cn("grid w-[240px] items-center gap-2", containerClassName)}
    >
      {label && (
        <Label htmlFor={String(name)} className={cn("flex", labelClassName)}>
          <p className="text-sm text-black">{label}</p>
          {required && <div className="text-red-500">*</div>}
        </Label>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id={String(name)}
          style={{
            border: "1px solid #ccc",
          }}
          checked={value}
          onCheckedChange={handleCheckedChange}
          {...rest}
        />
        <label
          htmlFor={String(name)}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {message}
        </label>
      </div>
    </div>
  );
};
