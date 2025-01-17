import { pgDb } from "@/app/db/db";
import { IdentityProvider, UserInfo, UserKey } from "@/app/db/types";
import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";

async function findUserByUserKey(userKey: UserKey) {
  const user = await pgDb
    .selectFrom("calmerUser")
    .selectAll()
    .where("userId", "=", userKey.userId)
    .where("identityProvider", "=", userKey.identityProvider)
    .executeTakeFirst();

  return user;
}

async function findLastUserSession(userId: string) {
  const session = await pgDb
    .selectFrom("userSession")
    .selectAll()
    .where("userId", "=", userId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .executeTakeFirst();

  return session;
}

export async function GET(request: NextRequest) {
  const searchParams = new URLSearchParams(request.url);
  const userIdParam = searchParams.get("uid");
  const ipParam = searchParams.get("ip") as IdentityProvider | undefined;

  if (!userIdParam) {
    return Response.json(
      { success: false, error: "uid is required" },
      { status: 400 }
    );
  }

  const uid = userIdParam;
  const ip = ipParam || "fc";

  const user = await findUserByUserKey({ userId: uid, identityProvider: ip });
  const lastSession = user ? await findLastUserSession(user.id) : null;

  if (!user) {
    return Response.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  return Response.json({ success: true, data: { user, lastSession } });
}

export async function POST(request: NextRequest) {
  const requestJson = (await request.json()) as {
    userId: string;
    identityProvider: IdentityProvider;
    userInfo: UserInfo;
    data: Record<string, string | number | boolean | null | undefined>;
  };

  const { userId, identityProvider, userInfo, data } = requestJson;

  const user = await findUserByUserKey({ userId, identityProvider });
  // create user if not found
  if (!user) {
    const id = uuid();
    const newUser = await pgDb
      .insertInto("calmerUser")
      .values({
        id,
        userId,
        identityProvider,
        userInfo: JSON.stringify(userInfo),
        createdAt: new Date(),
        updatedAt: new Date(),
        data: data ? JSON.stringify(data) : null,
      })
      .returningAll()
      .executeTakeFirst();
    return Response.json({
      success: true,
      data: { user: newUser, newUser: true },
    });
  }

  const lastSession = await findLastUserSession(user.id);
  return Response.json({ success: true, data: { user, lastSession } });
}
