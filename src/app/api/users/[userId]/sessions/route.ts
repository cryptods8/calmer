import { pgDb } from "@/app/db/db";
import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  // TODO: Check if user exists
  const { data } = await request.json();
  const sessionId = uuid();
  const session = await pgDb
    .insertInto("userSession")
    .values({
      userId,
      id: sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      data: JSON.stringify(data),
    })
    .returningAll()
    .executeTakeFirst();

  return Response.json({ success: true, data: { session } });
}
