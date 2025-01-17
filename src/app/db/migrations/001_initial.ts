import { Kysely, sql } from "kysely";
import { Database } from "../types";

export async function up(db: Kysely<Database>) {
  await db.schema
    .createTable("calmer_user")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("user_id", "varchar", (col) => col.notNull())
    .addColumn("identity_provider", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("user_info", "jsonb")
    .addColumn("notifications_enabled_at", "timestamptz")
    .addColumn("notification_details", "jsonb")
    .addColumn("data", "jsonb")
    .execute();

  await db.schema
    .createTable("user_session")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("user_id", "uuid", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("finished_at", "timestamptz")
    .addColumn("data", "jsonb")
    .execute();

  await db.schema
    .createIndex("user_session_user_id_idx")
    .on("user_session")
    .column("user_id")
    .execute();
  await db.schema
    .createIndex("calmer_user_user_id_identity_provider_idx")
    .on("calmer_user")
    .columns(["user_id", "identity_provider"])
    .execute();
}

export async function down(db: Kysely<Database>) {
  await db.schema.dropIndex("user_session_user_id_idx").execute();
  await db.schema
    .dropIndex("calmer_user_user_id_identity_provider_idx")
    .execute();
  await db.schema.dropTable("user_session").ifExists().execute();
  await db.schema.dropTable("calmer_user").ifExists().execute();
}
