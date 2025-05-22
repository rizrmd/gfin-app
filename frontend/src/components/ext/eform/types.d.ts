import type { Field } from "./field";
import type { CalendarSelect } from "./fields/calendar-select";
import type { CheckboxLabel } from "./fields/checkbox-label";
import type { InputField } from "./fields/input-field";
import type { MonthYearSelect } from "./fields/month-year-select";
import type { MultipleSelect } from "./fields/multiple-select";
import type { SingleSelect } from "./fields/single-select";
import type { UploadFile } from "./fields/upload-file";

export type TField<K extends string> = typeof Field<K>;
export type TInputField<K extends string> = typeof InputField<K>;
export type TSingleSelect<K extends string> = typeof SingleSelect<K>;
export type TMultipleSelect<K extends string> = typeof MultipleSelect<K>;
export type TCalendarSelect<K extends string> = typeof CalendarSelect<K>;
export type TMonthYearSelect<K extends string> = typeof MonthYearSelect<K>;
export type TCheckboxLabel<K extends string> = typeof CheckboxLabel<K>;
export type TUploadFile<K extends string> = typeof UploadFile<K>;

type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

type EFormChildren<T, K extends string> = {
  Field: TField<K>;
  submit: () => void;
  read: DeepReadonly<T>;
  write: T;
};
