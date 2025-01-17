import { pgDb } from "./db";
import { DBUser, DBUserInsert, DBUserUpdate, UserKey } from "./types";

export async function insertUser(user: DBUserInsert) {
  return await pgDb.insertInto("calmerUser").values(user).execute();
}

export async function updateUser(userKey: UserKey, user: DBUserUpdate) {
  return await pgDb
    .updateTable("calmerUser")
    .set(user)
    .where("userId", "=", userKey.userId)
    .where("identityProvider", "=", userKey.identityProvider)
    .execute();
}

export async function findUserByUserKey(userKey: UserKey): Promise<DBUser | null> {
  const result = await pgDb
    .selectFrom("calmerUser")
    .selectAll()
    .where("userId", "=", userKey.userId)
    .where("identityProvider", "=", userKey.identityProvider)
    .executeTakeFirst();

  return result ?? null;
}
