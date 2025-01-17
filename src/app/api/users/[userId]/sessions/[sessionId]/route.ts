import { NextRequest } from "next/server";
import { pgDb } from "@/app/db/db";

export async function PUT(
  request: NextRequest,
  context: { params: { userId: string; sessionId: string } }
) {
  const requestJson = (await request.json()) as {
    data: Record<string, string | number | boolean | null | undefined> | null;
    finishedAt: Date | null;
  };

  const session = await pgDb
    .updateTable("userSession")
    .set({
      data: requestJson.data ? JSON.stringify(requestJson.data) : null,
      finishedAt: requestJson.finishedAt,
      updatedAt: new Date(),
    })
    .where("id", "=", context.params.sessionId)
    .returningAll()
    .executeTakeFirst();

  return Response.json({ success: true, data: { session } });
}
