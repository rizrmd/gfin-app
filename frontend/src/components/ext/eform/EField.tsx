import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  }: {
    name: K;
    label?: string;
    className?: string;
    disabled?: boolean;
    optional?: boolean;
    input?: React.ComponentProps<"input">;
  }
) {
  const read = useSnapshot(this.data);

  const write = this.data as any;
  return (
    <div className={className}>
      <Label
        htmlFor={name}
        className={cn(!label && "capitalize")}
        onClick={() => {}}
      >
        {label || name}
        {optional && (
          <span className="text-gray-500 lowercase"> (optional)</span>
        )}
      </Label>
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
    </div>
  );
};

