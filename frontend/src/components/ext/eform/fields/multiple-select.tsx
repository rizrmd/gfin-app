import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSnapshot } from "valtio";
import Select, { type Props as ReactSelectProps } from "react-select";
import type { BasicSelectOpt } from "@/lib/types";
import { getNestedProperty, setNestedProperty } from "../utils";

interface Props<
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
> extends Omit<ReactSelectProps, "isMulti" | "disabled"> {
  name: K;
  containerClassName?: string;
  labelClassName?: string;
  label?: string;
  required?: boolean;
  selectClassName?: string;
  helperText?: string;
  isError?: boolean;
  errorMessage?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  isRtl?: boolean;
  closeMenuOnSelect?: boolean;
  maxMenuHeight?: number;
  onChange?: (value: BasicSelectOpt<string | number>) => void;
}

export const MultipleSelect = function <
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
>(
  this: { data: V },
  {
    name,
    containerClassName,
    labelClassName,
    label,
    required,
    selectClassName,
    helperText,
    isError,
    errorMessage,
    isSearchable = true,
    isClearable = true,
    isRtl = false,
    closeMenuOnSelect = true,
    maxMenuHeight = 240,
    onChange,
    value: externalValue,
    ...rest
  }: Props<K, V>
) {
  const read = useSnapshot(this.data);
  const write = this.data as any;

  const handleChange = (e: BasicSelectOpt<string | number>[]) => {
    const value = e;
    setNestedProperty(write, name, value);
    onChange?.(value as any);
  };

  const value = getNestedProperty(read, name);
  // value && console.log("multiple-select", value);

  return (
    <Select
      id={String(name)}
      className={cn("w-full", selectClassName)}
      isSearchable={isSearchable}
      isClearable={isClearable}
      isRtl={isRtl}
      isMulti={true}
      closeMenuOnSelect={closeMenuOnSelect}
      required={required}
      maxMenuHeight={maxMenuHeight}
      menuPosition="fixed"
      value={value}
      onChange={handleChange}
      styles={{
        multiValue: (base) => ({
          ...base,
          borderRadius: "6px",
        }),
        multiValueLabel: (base) => ({
          ...base,
        }),
        control: (base, state) => ({
          ...base,
          borderRadius: "6px",
          cursor: state.isDisabled ? "not-allowed" : "pointer",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: "6px",
        }),
        option: (base, state) => ({
          ...base,
          cursor: state.isDisabled ? "not-allowed" : "pointer",
        }),
      }}
      isDisabled={rest.disabled}
      {...(rest as any)}
    />
  );
};
