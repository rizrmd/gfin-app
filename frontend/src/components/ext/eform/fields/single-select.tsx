import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSnapshot } from "valtio";
import Select, { type Props as ReactSelectProps } from "react-select";
import type { BasicSelectOpt } from "@/lib/types";

interface Props<
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
> extends Omit<ReactSelectProps, "isMulti"> {
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
  isDisabled?: boolean;
  isLoading?: boolean;
  isRtl?: boolean;
  closeMenuOnSelect?: boolean;
  maxMenuHeight?: number;
  onChange?: (value: BasicSelectOpt<string | number>) => void;
}

export const SingleSelect = function <
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

  const handleChange = (e: BasicSelectOpt<string | number>) => {
    const value = e;
    write[name] = value;
    onChange?.(value);
  };

  const value = (read as any)[name];
  // value && console.log("single-select", value);

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

      <Select
        id={String(name)}
        className={cn("w-full", selectClassName)}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isRtl={isRtl}
        isMulti={false}
        closeMenuOnSelect={closeMenuOnSelect}
        required={required}
        maxMenuHeight={maxMenuHeight}
        menuPosition="fixed"
        value={value}
        onChange={handleChange}
        styles={{
          singleValue: (base) => ({
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
        {...rest}
      />

      {helperText && !isError ? (
        <p className="mt-0.5 text-xs font-light">{helperText}</p>
      ) : null}

      {errorMessage && isError ? (
        <p className="mt-0.5 text-xs text-red-500">{errorMessage}</p>
      ) : null}
    </div>
  );
};
