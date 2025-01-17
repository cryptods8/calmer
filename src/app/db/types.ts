import { Insertable, JSONColumnType, Selectable, Updateable } from "kysely";

export interface Database {
  calmerUser: UserTable;
  userSession: UserSessionTable;
}

export type IdentityProvider = "fc" | "anon" | "fc_unauth";

export interface UserKey {
  userId: string;
  identityProvider: IdentityProvider;
}

export interface UserInfo {
  displayName: string | null | undefined;
  username: string | null | undefined;
  profileImage: string | null | undefined;
}

type UserInfoColumnType = JSONColumnType<UserInfo>;

export interface UserTable extends UserKey {
  id: string;

  createdAt: Date;
  updatedAt: Date;
  userInfo: UserInfoColumnType;

  notificationsEnabledAt: Date | null;
  notificationDetails: JSONColumnType<{
    token: string;
    url: string;
  }> | null;

  data: JSONColumnType<{
    [key: string]: string | number | boolean | null | undefined;
  }> | null;
}

export interface UserSessionTable {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
  data: JSONColumnType<{
    [key: string]: string | number | boolean | null | undefined;
  }> | null;
}

export type DBUser = Selectable<UserTable>;
export type DBUserInsert = Insertable<UserTable>;
export type DBUserUpdate = Updateable<UserTable>;
export type DBUserSession = Selectable<UserSessionTable>;
export type DBUserSessionInsert = Insertable<UserSessionTable>;
export type DBUserSessionUpdate = Updateable<UserSessionTable>;
