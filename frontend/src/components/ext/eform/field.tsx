import { Label } from "@/components/ui/label";
import { InputField } from "./fields/input-field";
import type {
  TCalendarSelect,
  TCheckboxGroup,
  TCheckboxLabel,
  TInputField,
  TMonthYearSelect,
  TMultipleSelect,
  TSingleSelect,
  TUploadFile,
  FieldProps,
} from "./types";
import { capitalize } from "lodash";
import { css } from "goober";
import { cn } from "@/lib/utils";
import type { CheckboxOption } from "./fields/checkbox-group";
import { getNestedProperty, setNestedProperty } from "./utils";

type FieldContext<K extends string> = {
  Input: TInputField<K>;
  SingleSelect: TSingleSelect<K>;
  MultipleSelect: TMultipleSelect<K>;
  CalendarSelect: TCalendarSelect<K>;
  MonthYearSelect: TMonthYearSelect<K>;
  Checkbox: TCheckboxLabel<K>;
  CheckboxGroup: TCheckboxGroup<K>;
  UploadFile: TUploadFile<K>;
  data: Record<string, any>;
};

export const Field = function <K extends string>(
  this: FieldContext<K>,
  props: FieldProps<K>
) {
  const {
    name,
    placeholder,
    disabled,
    type,
    label,
    input,
    singleSelect,
    multiSelect,
    calendarSelect,
    monthYearSelect,
    checkbox,
    checkboxGroup,
    upload,
    className,
    helperText,
    errorMessage,
    errors,
  } = props;

  let current_type = "input";
  if (singleSelect) current_type = "singleSelect";
  if (multiSelect) current_type = "multiSelect";
  if (calendarSelect) current_type = "calendarSelect";
  if (monthYearSelect) current_type = "monthYearSelect";
  if (checkbox) current_type = "checkbox";
  if (checkboxGroup) current_type = "checkboxGroup";
  if (upload) current_type = "upload";

  return (
    <Label
      className={cn(
        "flex flex-col items-stretch gap-2",
        className,
        css`
          > div {
            width: 100%;
          }
        `
      )}
    >
      <span>{typeof label === "string" ? label : capitalize(name)}</span>
      {current_type === "input" && (
        <this.Input
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          type={type}
          {...input}
        />
      )}
      {current_type === "singleSelect" && (
        <this.SingleSelect
          name={name}
          placeholder={placeholder}
          {...singleSelect}
        />
      )}
      {current_type === "multiSelect" && (
        <this.MultipleSelect
          name={name}
          placeholder={placeholder}
          {...multiSelect}
        />
      )}
      {current_type === "calendarSelect" && (
        <this.CalendarSelect
          name={name}
          placeholder={placeholder}
          {...calendarSelect}
        />
      )}
      {current_type === "monthYearSelect" && (
        <this.MonthYearSelect
          name={name}
          placeholder={placeholder}
          {...monthYearSelect}
        />
      )}
      {current_type === "checkbox" && (
        <this.Checkbox name={name} {...checkbox} />
      )}
      {current_type === "checkboxGroup" && checkboxGroup && (
        <this.CheckboxGroup name={name} {...checkboxGroup} />
      )}
      {current_type === "upload" && <this.UploadFile name={name} {...upload} />}

      {helperText && !errorMessage ? (
        <p className="mt-0.5 text-xs font-light">{helperText}</p>
      ) : null}

      {errors?.length ? (
        <p className="mt-0.5 text-xs text-red-500">{errors[0]}</p>
      ) : errorMessage ? (
        <p className="mt-0.5 text-xs text-red-500">{errorMessage}</p>
      ) : null}
    </Label>
  );
};
