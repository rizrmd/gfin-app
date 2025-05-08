import type { PrismaClient } from "shared/models";
import type { defineDB, ModelOperations } from "rlib/server";

declare global {
  const db = new PrismaClient();
}
