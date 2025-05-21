import { useEffect, useState } from "react";
import Select from "react-select";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { CalendarDays, X } from "lucide-react";
import dayjs from "dayjs";
import useYearOpts from "@/lib/hooks/options/use-year";
import useMonthOpts from "@/lib/hooks/options/use-month";
import type { BasicSelectOpt } from "@/lib/types/index";
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
  isDisabled?: boolean;
}

export const MonthYearSelect = function <
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
>(
  this: { data: V },
  {
    name,
    containerClassName,
    label,
    labelClassName,
    placeholder,
    required,
    isDisabled,
    helperText,
    isError,
    errorMessage,
  }: Props<K, V>
) {
  const read = useSnapshot(this.data);
  const write = this.data as any;

  const value = (read as any)[name];
  // value && console.log("month-year-select", value);

  const [openPopover, setOpenPopover] = useState(false);

  const { arr: monthOpts, loading: isMonthOptsLoading } = useMonthOpts({});
  const { arr: yearOpts, loading: isYearOptsLoading } = useYearOpts({});

  const [selectedMonth, setSelectedMonth] = useState<BasicSelectOpt<number>>(
    monthOpts.find((opt) => opt.value === value?.getMonth())
  );
  const [selectedYear, setSelectedYear] = useState<BasicSelectOpt<number>>(
    yearOpts.find((opt) => opt.value === value?.getFullYear())
  );
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    if (!selectedMonth || !selectedYear) return;
    setSelectedDate(new Date(selectedYear.value, selectedMonth.value, 1));
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedDate) {
      write[name] = selectedDate;
    }
  }, [selectedDate]);

  const handleClearable = () => {
    setSelectedMonth(undefined);
    setSelectedYear(undefined);
    setSelectedDate(undefined);
    write[name] = undefined;
    setOpenPopover(false);
  };

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

      <Popover
        open={openPopover}
        onOpenChange={(e) => !isDisabled && setOpenPopover(e)}
      >
        <PopoverTrigger asChild>
          <div className="flex w-full relative">
            <Input
              id={String(name)}
              spellCheck={false}
              value={
                selectedDate ? dayjs(selectedDate).format("MMMM, YYYY") : ""
              }
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
                  !selectedDate && "hidden"
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
        <PopoverContent
          className="w-auto p-3 bg-white flex items-center gap-2"
          align="start"
        >
          <Select
            className="w-[140px]"
            options={monthOpts}
            isLoading={isMonthOptsLoading}
            placeholder="Month"
            onChange={setSelectedMonth}
            value={selectedMonth}
          />
          <Select
            className="w-[100px]"
            options={yearOpts}
            isLoading={isYearOptsLoading}
            placeholder="Year"
            onChange={setSelectedYear}
            value={selectedYear}
          />
        </PopoverContent>
      </Popover>

      {helperText && !isError ? (
        <p className="mt-0.5 text-xs font-light">{helperText}</p>
      ) : null}

      {errorMessage && isError ? (
        <p className="mt-0.5 text-xs text-red-500">{errorMessage}</p>
      ) : null}
    </div>
  );
};
