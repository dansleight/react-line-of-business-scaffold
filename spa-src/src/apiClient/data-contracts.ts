/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum LookupType {
  Unknown = "Unknown",
}

export interface ApiError {
  /** @format int32 */
  status: number;
  code: string;
  userMessage: string;
  message: string | null;
  traceId: string;
  errors: Record<string, string[]> | null;
  exception: ApiErrorException | null;
}

export interface ApiErrorException {
  type: string;
  message: string | null;
  stackTrace: string | null;
  inner: ApiErrorException | null;
}

export interface GlobalSettingsModel {
  applicationMode: string;
  msalSettings: MsalSettingsModel | null;
  buildNumber: string | null;
}

export interface GoodModel {
  /** @format int32 */
  id: number;
  name: string;
}

export interface ILookupItem {
  /** @format int32 */
  id: number;
  /** @format int32 */
  parentId: number | null;
  name: string;
  active: boolean;
}

export interface LookupModel {
  /** @format date-time */
  loadTime: string;
  lookupType: LookupType;
  parentLookupType: LookupType | null;
  items: ILookupItem[];
}

export interface MsalSettingsModel {
  clientId: string;
  authority: string;
  apiScope: string;
  provider: string | null;
}

export interface UserInfoModel {
  personId: string;
  email: string | null;
  displayName: string;
  roles: string[];
}
