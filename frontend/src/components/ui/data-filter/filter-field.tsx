import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ControllerRenderProps } from "react-hook-form";

interface FilterFieldProps {
  field: ControllerRenderProps<any, string>;
  column: {
    header: string;
    filter?: {
      type: "text" | "dropdown" | "date";
      options?: { value: string; label: string }[];
    };
  };
}

export function FilterField({ field, column }: FilterFieldProps) {
  return (
    <FormItem className="flex-1 mx-2">
      <FormLabel className="text-sm font-medium">{column.header}</FormLabel>
      <FormControl>
        {column.filter?.type === "dropdown" ? (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger>
              <SelectValue
                placeholder={`Pilih ${column.header.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {column.filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : column.filter?.type === "date" ? (
          <Input type="date" {...field} />
        ) : (
          <Input
            placeholder={`Cari ${column.header.toLowerCase()}`}
            {...field}
          />
        )}
      </FormControl>
    </FormItem>
  );
}