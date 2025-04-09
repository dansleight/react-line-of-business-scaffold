/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CollectionObject {
  /** @format int32 */
  collectionId: number;
  name: string;
  description: string | null;
  collectionType: CollectionType;
}

export enum CollectionType {
  Default = "Default",
  Special = "Special",
}

export interface GlobalSettingsModel {
  applicationMode: string;
  msalSettings: MsalSettingsModel | null;
}

export interface MsalSettingsModel {
  clientId: string;
  authority: string;
  apiScope: string;
}

export interface GoodModel {
  /** @format int32 */
  id: number;
  name: string;
}

export interface BadRequestModel {
  message: string;
  userMessage: string | null;
}
