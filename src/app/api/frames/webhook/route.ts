import {
  ParseWebhookEvent,
  parseWebhookEvent,
  createVerifyAppKeyWithHub,
} from "@farcaster/frame-node";
import { NextRequest } from "next/server";
import { sendFrameNotifications } from "@/app/utils/send-frame-notifications";
import { hubHttpUrl, hubRequestOptions } from "@/app/constants";
import { DBUser, UserKey } from "@/app/db/types";
import { insertUser, updateUser, findUserByUserKey } from "@/app/db/user-db";
import { v4 as uuid } from "uuid";

async function setUserNotificationDetails(
  userKey: UserKey,
  user: DBUser | null,
  notificationDetails: { token: string; url: string }
) {
  if (user) {
    await updateUser(userKey, {
      notificationDetails: JSON.stringify(notificationDetails),
      notificationsEnabledAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    await insertUser({
      ...userKey,
      id: uuid(),
      userInfo: JSON.stringify({}),
      notificationDetails: JSON.stringify(notificationDetails),
      notificationsEnabledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

async function deleteUserNotificationDetails(
  userKey: UserKey,
  user: DBUser | null
) {
  if (!user) {
    return;
  }
  await updateUser(userKey, {
    notificationsEnabledAt: null,
    updatedAt: new Date(),
  });
}

export async function POST(request: NextRequest) {
  const requestJson = await request.json();

  if (!hubHttpUrl) {
    throw new Error("Hub HTTP URL is not set");
  }
  const verifyAppKeyWithHub = createVerifyAppKeyWithHub(
    hubHttpUrl,
    hubRequestOptions
  );

  let data;
  try {
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithHub);
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType;

    switch (error.name) {
      case "VerifyJsonFarcasterSignature.InvalidDataError":
      case "VerifyJsonFarcasterSignature.InvalidEventDataError":
        // The request data is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
        // The app key is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 401 }
        );
      case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
        // Internal error verifying the app key (caller may want to try again)
        return Response.json(
          { success: false, error: error.message },
          { status: 500 }
        );
    }
  }

  const fid = data.fid;
  const event = data.event;

  const userKey: UserKey = {
    userId: fid.toString(),
    identityProvider: "fc",
  };

  const user = await findUserByUserKey(userKey);

  switch (event.event) {
    case "frame_added":
      if (event.notificationDetails) {
        await setUserNotificationDetails(
          userKey,
          user,
          event.notificationDetails
        );
        await sendFrameNotifications({
          recipients: [{ fid, notificationDetails: event.notificationDetails }],
          title: "Welcome to Calmer",
          body: "Calmer is now added to your frames",
        });
      } else {
        await deleteUserNotificationDetails(userKey, user);
      }

      break;
    case "frame_removed":
      await deleteUserNotificationDetails(userKey, user);

      break;
    case "notifications_enabled":
      await setUserNotificationDetails(
        userKey,
        user,
        event.notificationDetails
      );
      await sendFrameNotifications({
        recipients: [{ fid, notificationDetails: event.notificationDetails }],
        title: "Calmer notifications enabled",
        body: "You'll now receive daily reminders to get calmer",
      });

      break;
    case "notifications_disabled":
      await deleteUserNotificationDetails(userKey, user);

      break;
  }

  return Response.json({ success: true });
}
