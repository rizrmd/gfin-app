import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSnapshot } from "valtio";

export const EField = function <
  K extends Exclude<keyof V, symbol | number>,
  V extends Record<string, any> = Record<string, any>
>(
  this: { data: V },
  {
    name,
    label,
    className,
    input,
    disabled,
    optional,
    dropdown,
  }: {
    name: K;
    label?: string;
    className?: string;
    disabled?: boolean;
    optional?: boolean;
    dropdown?: {
      options: { label: string; value: string }[];
    };
    input?: React.ComponentProps<"input">;
  }
) {
  const read = useSnapshot(this.data);
  const write = this.data as any;

  return (
    <Label onClick={() => {}} className={cn("flex flex-col", className)}>
      <div className={cn("mb-2 field-label",!label && "capitalize")}>
        {label || name}
        {optional && (
          <span className="text-gray-500 lowercase"> (optional)</span>
        )}
      </div>

      {dropdown ? (
        <Select
          value={(read as any)[name]}
          onValueChange={(value) => {
            write[name] = value;
          }}
          disabled={disabled}
        >
          <SelectTrigger className={cn(disabled && "bg-muted")}>
            <SelectValue placeholder={`Select ${label || name}`} />
          </SelectTrigger>
          <SelectContent>
            {dropdown.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={name}
          spellCheck={false}
          value={(read as any)[name]}
          disabled={disabled}
          className={cn(disabled && "bg-muted")}
          onChange={(e) => {
            write[name] = e.currentTarget.value;
          }}
          {...input}
        />
      )}
    </Label>
  );
};
