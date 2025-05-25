import type { Field } from "./field";
import type { CalendarSelect } from "./fields/calendar-select";
import type { CheckboxGroup } from "./fields/checkbox-group";
import type { CheckboxLabel } from "./fields/checkbox-label";
import type { InputField } from "./fields/input-field";
import type { MonthYearSelect } from "./fields/month-year-select";
import type { MultipleSelect } from "./fields/multiple-select";
import type { SingleSelect } from "./fields/single-select";
import type { UploadFile } from "./fields/upload-file";
import type { Section } from "./section";

export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

// Helper type for extracting all possible path strings in an object using dot notation
export type PathsToStringProps<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: 
        K extends string | number 
          ? `${K}` | `${K}.${PathsToStringProps<T[K]>}` 
          : never;
    }[keyof T & (string | number)] | Extract<keyof T, string>
  : never;

// Get all possible paths of an object, including nested paths with dot notation
export type DotNotationKeys<T> = Extract<keyof T, string> | PathsToStringProps<T>;

export type TField<K extends string> = typeof Field<K>;
export type TInputField<K extends string> = typeof InputField<K>;
export type TSingleSelect<K extends string> = typeof SingleSelect<K>;
export type TMultipleSelect<K extends string> = typeof MultipleSelect<K>;
export type TCalendarSelect<K extends string> = typeof CalendarSelect<K>;
export type TMonthYearSelect<K extends string> = typeof MonthYearSelect<K>;
export type TCheckboxLabel<K extends string> = typeof CheckboxLabel<K>;
export type TCheckboxGroup<K extends string> = typeof CheckboxGroup<K>;
export type TUploadFile<K extends string> = typeof UploadFile<K>;
export type TSection = typeof Section;

export type EFormChildren<T extends object, K extends string = string> = {
  Field: TField<K>;
  Section: TSection;
  submit: () => void;
  read: DeepReadonly<T>;
  write: T;
};
