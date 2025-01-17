import { NextRequest, NextResponse } from "next/server";
import { sendFrameNotifications } from "@/app/utils/send-frame-notifications";
import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { pgDb } from "@/app/db/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MORNING_HOUR = 8;
const EVENING_HOUR = 21;

type ToNotify = {
  userId: string;
  notificationDetails: FrameNotificationDetails;
};

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  const now = new Date();
  const utcHour = now.getUTCHours();
  const morningOffsetMinutes = (utcHour - MORNING_HOUR) * 60;
  const eveningOffsetMinutes = (utcHour - EVENING_HOUR) * 60;

  console.log("morningOffsetMinutes", morningOffsetMinutes);
  console.log("eveningOffsetMinutes", eveningOffsetMinutes);

  try {
    const toNotify = await pgDb
      .with("latest_session_timestamp", (db) =>
        db
          .selectFrom("userSession as s")
          .select((db) => [
            "s.userId",
            db.fn.max("s.createdAt").as("latestSessionTimestamp"),
          ])
          .groupBy("s.userId")
      )
      .selectFrom("calmerUser as r")
      .leftJoin(
        "latest_session_timestamp",
        "r.id",
        "latest_session_timestamp.userId"
      )
      .leftJoin("userSession as s", (join) =>
        join
          .onRef("s.userId", "=", "r.id")
          .onRef(
            "s.createdAt",
            "=",
            "latest_session_timestamp.latestSessionTimestamp"
          )
      )
      .select(["r.id", "r.userId", "r.notificationDetails", "s.data"])
      .where("notificationsEnabledAt", "is not", null)
      .where("identityProvider", "=", "fc")
      .where((db) =>
        db.or([
          db.eb.eb("s.finishedAt", "is", null),
          db.eb.eb(
            "s.finishedAt",
            "<",
            new Date(Date.now() - 1000 * 60 * 60 * 3)
          ),
        ])
      )
      .where((db) =>
        db.or([
          db.eb.between(
            db.fn.coalesce(
              db.ref("s.data", "->>").key("tzOffset").$castTo<number>(),
              db.val(0)
            ),
            morningOffsetMinutes,
            morningOffsetMinutes + 59
          ),
          db.eb.between(
            db.fn.coalesce(
              db.ref("s.data", "->>").key("tzOffset").$castTo<number>(),
              db.val(0)
            ),
            eveningOffsetMinutes,
            eveningOffsetMinutes + 59
          ),
        ])
      )
      .execute();
    const { morning, evening } = toNotify.reduce(
      (acc, { userId, data, notificationDetails }) => {
        if (!notificationDetails) {
          return acc;
        }
        const offset = data?.tzOffset ? Number(data.tzOffset) : 0;
        if (isNaN(offset) || offset < -720 || offset > 720) {
          // valid timezone range in minutes
          console.warn(`Invalid timezone offset for userId: ${userId}`);
          return acc;
        }
        if (
          morningOffsetMinutes <= offset &&
          offset <= morningOffsetMinutes + 59
        ) {
          acc.morning.push({ userId, notificationDetails });
        } else if (
          eveningOffsetMinutes <= offset &&
          offset <= eveningOffsetMinutes + 59
        ) {
          acc.evening.push({ userId, notificationDetails });
        }
        return acc;
      },
      { morning: [], evening: [] } as {
        morning: ToNotify[];
        evening: ToNotify[];
      }
    );

    const notifications = [
      {
        toNotify: morning,
        title: "Calmer in the morning",
        body: "Start your day with a calm mind",
      },
      {
        toNotify: evening,
        title: "Calmer in the evening",
        body: "End your day comfortably relaxed",
      },
    ];

    for (const { toNotify, title, body } of notifications) {
      // batch by 100
      for (let i = 0; i < toNotify.length; i += 100) {
        const recipients = toNotify
          .slice(i, i + 100)
          .reduce((acc, { userId, notificationDetails }) => {
            // Validate userId and notificationDetails
            const fid = parseInt(userId, 10);
            if (notificationDetails != null && !isNaN(fid)) {
              acc.push({
                fid,
                notificationDetails,
              });
            } else {
              console.warn(`Invalid notification data for userId: ${userId}`);
            }
            return acc;
          }, [] as { fid: number; notificationDetails: FrameNotificationDetails }[]);

        if (recipients.length > 0) {
          await sendFrameNotifications({ recipients, title, body });
          if (i + 100 < toNotify.length) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }
    }

    console.log("notifications sent", toNotify.length);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error sending notifications:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
