import { cn } from "@/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";
import { proxy, ref, useSnapshot } from "valtio";
import type {
  DeepReadonly,
  EFormChildren,
  TCalendarSelect,
  TCheckboxLabel,
  TInputField,
  TMonthYearSelect,
  TMultipleSelect,
  TSingleSelect,
  TUploadFile,
} from "./types";
import { InputField } from "./fields/input-field";
import { SingleSelect } from "./fields/single-select";
import { MultipleSelect } from "./fields/multiple-select";
import { CalendarSelect } from "./fields/calendar-select";
import { MonthYearSelect } from "./fields/month-year-select";
import { CheckboxLabel } from "./fields/checkbox-label";
import { UploadFile } from "./fields/upload-file";

export const Form = <
  T extends Record<string, any>,
  K extends Exclude<keyof T, number | symbol>
>(opt: {
  data: T;
  children: (opt: EFormChildren<T, K>) => ReactNode;
  onInit?: (opt: { read: DeepReadonly<T>; write: T }) => void;
  onSubmit?: (opt: { read: DeepReadonly<T>; write: T }) => void;
  className?: string;
}) => {
  const write = useRef(
    proxy({
      data: opt.data,
      Field: ref(() => {}) as unknown as TInputField<K>,
      Input: ref(() => {}) as unknown as TInputField<K>,
      SingleSelect: ref(() => {}) as unknown as TSingleSelect<K>,
      MultipleSelect: ref(() => {}) as unknown as TMultipleSelect<K>,
      CalendarSelect: ref(() => {}) as unknown as TCalendarSelect<K>,
      MonthYearSelect: ref(() => {}) as unknown as TMonthYearSelect<K>,
      Checkbox: ref(() => {}) as unknown as TCheckboxLabel<K>,
      UploadFile: ref(() => {}) as unknown as TUploadFile<K>,
      submit: ref(() => {}),
    })
  ).current;
  const read = useSnapshot(write);

  useEffect(() => {
    opt.onInit?.({ read: read.data as any, write: write.data });
    write.Input = ref(InputField.bind(write));
    write.SingleSelect = ref(SingleSelect.bind(write));
    write.MultipleSelect = ref(MultipleSelect.bind(write));
    write.CalendarSelect = ref(CalendarSelect.bind(write));
    write.MonthYearSelect = ref(MonthYearSelect.bind(write));
    write.Checkbox = ref(CheckboxLabel.bind(write));
    write.UploadFile = ref(UploadFile.bind(write));
  }, []);

  useEffect(() => {
    write.submit = ref(() => {
      opt.onSubmit?.({ read: read.data as any, write: write.data });
    });
  }, [opt.data]);

  return (
    <form
      className={cn(opt.className, "flex flex-col flex-1")}
      onSubmit={(e) => {
        e.preventDefault();
        read.submit();
      }}
    >
      {opt.children({
        Field: read.Input,
        Input: read.Input,
        SingleSelect: read.SingleSelect,
        MultipleSelect: read.MultipleSelect,
        CalendarSelect: read.CalendarSelect,
        MonthYearSelect: read.MonthYearSelect,
        Checkbox: read.Checkbox,
        UploadFile: read.UploadFile,
        submit: () => {
          read.submit();
        },
        read: read.data as any,
        write: write.data as any,
      })}
      <button type="submit" className="hidden"></button>
    </form>
  );
};
