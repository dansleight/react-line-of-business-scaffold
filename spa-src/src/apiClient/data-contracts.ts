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

/** AddWidgetModel */
export interface AddWidgetModel {
  /** Name */
  name: string;
  /** Description */
  description: string | null;
}

/** BadRequestModel */
export interface BadRequestModel {
  /** Message */
  message: string;
  /** Usermessage */
  userMessage: string | null;
}

/** GlobalSettingsModel */
export interface GlobalSettingsModel {
  /** Applicationmode */
  applicationMode: string;
  msalSettings: MsalSettingsModel;
}

/** GoodModel */
export interface GoodModel {
  /** Id */
  id: number;
  /** Name */
  name: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail: ValidationError[];
}

/** MsalSettingsModel */
export interface MsalSettingsModel {
  /** Clientid */
  clientId: string;
  /** Authority */
  authority: string;
  /** Apiscope */
  apiScope: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** WidgetObject */
export interface WidgetObject {
  /** Widgetid */
  widgetId: number;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
}
