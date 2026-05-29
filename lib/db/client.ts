import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type SqlClient = ReturnType<typeof neon>;
type DbClient = ReturnType<typeof createDb>;

let cachedSql: SqlClient | null = null;
let cachedDb: DbClient | null = null;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

function createDb() {
  return drizzle(getSql(), { schema });
}

export function getSql() {
  cachedSql ??= neon(getDatabaseUrl());
  return cachedSql;
}

export function getDb() {
  cachedDb ??= createDb();
  return cachedDb;
}

export const sql = new Proxy((() => undefined) as unknown as SqlClient, {
  apply(_target, thisArg, argArray) {
    return Reflect.apply(getSql() as unknown as (...args: unknown[]) => unknown, thisArg, argArray);
  },
  get(_target, prop, receiver) {
    const client = getSql();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const db = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    const client = getDb();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
export { schema };
