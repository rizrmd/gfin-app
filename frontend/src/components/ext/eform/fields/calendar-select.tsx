import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { CalendarDays, X } from "lucide-react";
import { useState } from "react";
import { useSnapshot } from "valtio";

interface Props<
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
> {
  name: K;
  containerClassName?: string;
  labelClassName?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  isError?: boolean;
  errorMessage?: string;
  onChange?: (value: Date | undefined) => void;
  onBlur?: () => void;
  value?: Date | undefined;
  isDisabled?: boolean;
  disabledCalendar?:
    | { before: Date }
    | { after: Date }
    | ((date: Date) => boolean);
}

export const CalendarSelect = function <
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
>(
  this: { data: V },
  {
    name,
    containerClassName,
    labelClassName,
    label,
    placeholder,
    required,
    helperText,
    isError,
    errorMessage,
    onChange,
    onBlur,
    value: externalValue,
    isDisabled,
    disabledCalendar,
  }: Props<K, V>
) {
  const read = useSnapshot(this.data);
  const write = this.data as any;

  const value = (read as any)[name];
  // value && console.log("calendar-select", value);

  const [openPopover, setOpenPopover] = useState(false);

  const handleDaySelect = (date: Date | undefined) => {
    const value = date;
    write[name] = value;
    onChange?.(value);
    setOpenPopover(false);
  };

  const handleClearable = () => {
    const value = undefined;
    write[name] = value;
    onChange?.(value);
    setOpenPopover(false);
  };

  return (
    <Popover
      open={openPopover}
      onOpenChange={(e) => !isDisabled && setOpenPopover(e)}
    >
      <PopoverTrigger asChild>
        <div className="flex w-full relative">
          <Input
            id={String(name)}
            spellCheck={false}
            value={value ? dayjs(value).format("YYYY-MM-DD") : ""}
            onClick={() => !isDisabled && setOpenPopover(true)}
            className={cn(
              "pr-10 rounded-md box-border disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300 min-h-[38px] bg-white focus-visible:border-2 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-0 focus:border-2 focus:border-primary focus:outline-none focus:ring-0",
              openPopover && !isDisabled && "border-2 border-primary"
            )}
            readOnly
            disabled={isDisabled}
            placeholder={placeholder}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <X
              className={cn(
                "h-[15px] w-[15px] text-gray-400 cursor-pointer",
                !value && "hidden"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleClearable();
              }}
            />
            <CalendarDays className="h-[18px] w-[18px] text-gray-600" />
          </div>
        </div>
      </PopoverTrigger>
      {errorMessage && (
        <p className="mt-0.5 text-xs text-red-500">{errorMessage}</p>
      )}
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          className="rounded-md border shadow"
          selected={value}
          onSelect={handleDaySelect}
          onDayBlur={onBlur}
          disabled={disabledCalendar}
        />
      </PopoverContent>
    </Popover>
  );
};

export const PopoverCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border shadow"
    />
  );
};
