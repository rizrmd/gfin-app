import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { proxy, ref, useSnapshot } from "valtio";
import { CalendarSelect } from "./fields/calendar-select";
import { CheckboxGroup } from "./fields/checkbox-group";
import { CheckboxLabel } from "./fields/checkbox-label";
import { InputField } from "./fields/input-field";
import { MonthYearSelect } from "./fields/month-year-select";
import { MultipleSelect } from "./fields/multiple-select";
import { SingleSelect } from "./fields/single-select";
import { UploadFile } from "./fields/upload-file";
import { Section } from "./section";
import type {
  DeepReadonly,
  DotNotationKeys,
  EFormChildren,
  TCalendarSelect,
  TCheckboxGroup,
  TCheckboxLabel,
  TField,
  TInputField,
  TMonthYearSelect,
  TMultipleSelect,
  TSection,
  TSingleSelect,
  TUploadFile, ValidationErrors, ValidationRule
} from "./types";
import { hasErrors, validateForm } from "./validation";

export const Form = <
  T extends Record<string, any>,
  K extends DotNotationKeys<T> = DotNotationKeys<T>
>(opt: {
  data: T;
  children: (opt: EFormChildren<T, K>) => ReactNode;
  onInit?: (opt: { read: DeepReadonly<T>; write: T }) => void;
  onSubmit?: (opt: {
    read: DeepReadonly<T>;
    write: T;
    isValid: boolean;
  }) => void;
  className?: string;
  validator?: Record<string, ValidationRule | ValidationRule[]>;
}) => {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  const write = useRef(
    proxy({
      data: opt.data,
      Field: ref(() => {}) as unknown as TField<string>,
      Input: ref(() => {}) as unknown as TInputField<string>,
      SingleSelect: ref(() => {}) as unknown as TSingleSelect<string>,
      MultipleSelect: ref(() => {}) as unknown as TMultipleSelect<string>,
      CalendarSelect: ref(() => {}) as unknown as TCalendarSelect<string>,
      MonthYearSelect: ref(() => {}) as unknown as TMonthYearSelect<string>,
      Checkbox: ref(() => {}) as unknown as TCheckboxLabel<string>,
      CheckboxGroup: ref(() => {}) as unknown as TCheckboxGroup<string>,
      UploadFile: ref(() => {}) as unknown as TUploadFile<string>,
      Section: ref(() => {}) as unknown as TSection,
      submit: ref(() => {}),
    })
  ).current;
  const read = useSnapshot(write);

  useEffect(() => {
    opt.onInit?.({ read: read.data as any, write: write.data });
    write.Field = ref(InputField.bind(write));
    // write.Field = ref(Field.bind(write));
    write.Input = ref(InputField.bind(write));
    write.SingleSelect = ref(SingleSelect.bind(write));
    write.MultipleSelect = ref(MultipleSelect.bind(write));
    write.CalendarSelect = ref(CalendarSelect.bind(write));
    write.MonthYearSelect = ref(MonthYearSelect.bind(write));
    write.Checkbox = ref(CheckboxLabel.bind(write));
    write.CheckboxGroup = ref(CheckboxGroup.bind(write));
    write.UploadFile = ref(UploadFile.bind(write));
    write.Section = ref(Section.bind(write));
  }, []);

  useEffect(() => {
    write.submit = ref(() => {
      if (opt.validator) {
        const validationErrors = validateForm(write.data, opt.validator);
        setErrors(validationErrors);
        const isValid = !hasErrors(validationErrors);
        opt.onSubmit?.({ read: read.data as any, write: write.data, isValid });
      } else {
        opt.onSubmit?.({
          read: read.data as any,
          write: write.data,
          isValid: true,
        });
      }
    });
  }, [opt.data, opt.validator]);

  return (
    <form
      className={cn(opt.className, "flex flex-col flex-1")}
      onSubmit={(e) => {
        e.preventDefault();
        read.submit();
      }}
    >
      {opt.children({
        Field: read.Field as unknown as TField<K>,
        Section: read.Section,
        submit: () => {
          read.submit();
        },
        read: read.data as any,
        write: write.data as any,
        errors,
      })}
      <button type="submit" className="hidden"></button>
    </form>
  );
};
