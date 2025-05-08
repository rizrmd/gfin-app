import { cn } from "@/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";
import { proxy, ref, snapshot, useSnapshot } from "valtio";
import { EField } from "./EField";
import type { DeepReadonly, EFormChildren, ExtFieldType } from "./types";

export const EForm = <
  T extends Record<string, any>,
  K extends Exclude<keyof T, number | symbol>
>(opt: {
  data: T;
  children: (opt: EFormChildren<T, K>) => ReactNode;
  onSubmit?: (opt: { read: DeepReadonly<T>; write: T }) => void;
  className?: string;
}) => {
  const write = useRef(
    proxy({
      data: opt.data,
      Field: ref(() => {}) as unknown as ExtFieldType<K>,
      submit: ref(() => {}),
    })
  ).current;
  const read = useSnapshot(write);

  useEffect(() => {
    write.Field = ref(EField.bind(write));
    write.submit = ref(() => {
      opt.onSubmit?.({ read: snapshot(write.data) as any, write: write.data });
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
        Field: read.Field,
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
