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

import {
  AddWidgetModel,
  BadRequestModel,
  GlobalSettingsModel,
  GoodModel,
  HttpValidationError,
  WidgetObject,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Settings
   * @name SettingsGet
   * @summary Gets the global settings necessary for the SPA to start, including MSAL settings for Authentication
   * @request GET:/api/settings
   */
  settingsGet = (params: RequestParams = {}) =>
    this.request<GlobalSettingsModel, any>({
      path: `/api/settings`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Test
   * @name TestGet
   * @request GET:/api/test/{id}
   * @secure
   */
  testGet = (id: number, params: RequestParams = {}) =>
    this.request<GoodModel, BadRequestModel>({
      path: `/api/test/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Widget
   * @name WidgetGet
   * @request GET:/api/widget
   * @secure
   */
  widgetGet = (params: RequestParams = {}) =>
    this.request<WidgetObject[], any>({
      path: `/api/widget`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Widget
   * @name WidgetAdd
   * @request POST:/api/widget
   * @secure
   */
  widgetAdd = (data: AddWidgetModel, params: RequestParams = {}) =>
    this.request<WidgetObject, HttpValidationError>({
      path: `/api/widget`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Widget
   * @name WidgetGet2
   * @request GET:/api/widget/{widgetId}
   * @originalName widgetGet
   * @duplicate
   * @secure
   */
  widgetGet2 = (widgetId: number, params: RequestParams = {}) =>
    this.request<WidgetObject, any>({
      path: `/api/widget/${widgetId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
