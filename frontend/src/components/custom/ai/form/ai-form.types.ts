export type AIFieldText = {
  type: "text-input" | "text-area" | "label";
  suggestions?: string[];
  title?: string;
  field: string;
  required?: boolean;
};

export type AIFieldCheckbox = {
  type: "checkbox";
  options: { label: string; value: string }[];
  mode: "object-boolean" | "array-string";
  layout?: "horizontal" | "vertical" | "dropdown";
  title?: string;
  field: string;
  required?: boolean;
};

export type AIFieldDropdown = {
  type: "dropdown";
  options: { label: string; value: string }[];
  title?: string;
  field: string;
  required?: boolean;
};

export type AIFormSection = {
  type: "section";
  title: string;
  childs: AIField[]; // Allow nested sections
  isArray?: boolean;
  labelField?: string;
  canAdd?: boolean;
  canRemove?: boolean;
  canMove?: boolean;
};

export type AIField = (AIFieldText | AIFieldCheckbox | AIFieldDropdown) & {
  width?: "full" | "half";
};
export type AIFormLayout = AIField | AIFormSection;
