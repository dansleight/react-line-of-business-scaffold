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

export interface AddWidgetModel {
  name: string;
  description: string | null;
}

export interface BadRequestModel {
  message: string;
  userMessage: string | null;
}

export interface GlobalSettingsModel {
  applicationMode: string;
  msalSettings: MsalSettingsModel | null;
}

export interface GoodModel {
  /** @format int32 */
  id: number;
  name: string;
}

export interface MsalSettingsModel {
  clientId: string;
  authority: string;
  apiScope: string;
}

export interface WidgetObject {
  /** @format int32 */
  widgetId: number;
  name: string;
  description: string | null;
}
