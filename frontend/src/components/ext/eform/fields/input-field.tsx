import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { proxy, useSnapshot } from "valtio";
import { getNestedProperty, setNestedProperty } from "../utils";
import { useLocal } from "@/lib/hooks/use-local";

type Props<
  K extends string,
  V extends Record<string, any> = Record<string, any>
> = {
  name: K;
  containerClassName?: string;
  labelClassName?: string;
  label?: string;
  required?: boolean;
  maxMenuHeight?: number;
  onChange?: (value: string) => void;
} & React.ComponentProps<"input">;

export const InputField = function <
  K extends string,
  V extends Record<string, any> = Record<string, any>
>(
  this: { data: V },
  {
    name,
    containerClassName,
    labelClassName,
    label,
    required,
    maxMenuHeight = 37,
    onChange,
    ...rest
  }: Props<K, V>
) {
  const read = useSnapshot(this.data, { sync: true });
  const write = this.data as any;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setNestedProperty(write, name, value);
    onChange?.(value);
  };

  const value = getNestedProperty(read, name);

  return (
    <Input
      id={String(name)}
      spellCheck={false}
      value={value}
      autoComplete={String(name)}
      autoCorrect="off"
      autoCapitalize="none"
      onChange={handleChange}
      {...rest}
      className="bg-[#fff] rounded-md ring-0 shadow-2xs active:border-2 outline-none focus:border-2 focus:outline-none focus:border-primary focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none border-[#ccc] hover:border-[#999999]"
      style={{ height: `${maxMenuHeight}px` }}
    />
  );
};
