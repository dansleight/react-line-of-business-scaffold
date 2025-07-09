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
  /**
   * Name
   * Name
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /**
   * Widget Description
   * Describe the Widget
   */
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

export interface HttpValidationError {
  detail: ValidationError[] | null;
}

export interface MsalSettingsModel {
  clientId: string;
  authority: string;
  apiScope: string;
  /** Provider */
  provider: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface WidgetObject {
  /** @format int32 */
  widgetId: number;
  name: string;
  description: string | null;
}
