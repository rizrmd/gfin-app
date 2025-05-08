import type { Prisma } from "shared/models";


export const createStringFilter = (
  value: string | { contains: string; mode: "insensitive" }
): Prisma.StringFilter => {
  if (typeof value === "string") {
    return {
      contains: value,
      mode: "insensitive",
    };
  }
  return value;
};
