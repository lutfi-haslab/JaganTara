import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: "file:backend/jagantara.db",
});

export const db = drizzle(client, { schema });
