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
  HTTPValidationError,
  WidgetObject,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Verify Entra ID authentication and return user details from the JWT payload.
   *
   * @tags Authentication
   * @name GetApiAuthCheckGet
   * @summary Test protected endpoint
   * @request GET:/api/auth/check
   * @secure
   */
  getApiAuthCheckGet = (params: RequestParams = {}) =>
    this.request<Record<string, any>, any>({
      path: `/api/auth/check`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve a list of all widgets from the database. Requires authentication.
   *
   * @tags Widget
   * @name WidgetGet
   * @summary Get all widgets
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
   * @description Add a new widget to the database with name and description. Requires authentication.
   *
   * @tags Widget
   * @name WidgetAdd
   * @summary Create a new widget
   * @request POST:/api/widget
   * @secure
   */
  widgetAdd = (data: AddWidgetModel, params: RequestParams = {}) =>
    this.request<WidgetObject, HTTPValidationError>({
      path: `/api/widget`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve a widget by WidgetId using a raw SQL query. Requires authentication.
   *
   * @tags Widget
   * @name WidgetGetOne
   * @summary Get widget by WidgetId
   * @request GET:/api/widget/get/{id}
   * @secure
   */
  widgetGetOne = (id: number, params: RequestParams = {}) =>
    this.request<WidgetObject, HTTPValidationError>({
      path: `/api/widget/get/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Returns the necessary settings for the SPA to initialize
   *
   * @tags Settings
   * @name SettingsGet
   * @summary Get Global Settings
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
   * @description If the id is 0, -1 or -2 will throw a specific error.
   *
   * @tags Test
   * @name TestGet
   * @summary Gets a response that is based on the input.
   * @request GET:/api/test/{id}
   * @secure
   */
  testGet = (id: number, params: RequestParams = {}) =>
    this.request<GoodModel, HTTPValidationError>({
      path: `/api/test/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Test
   * @name TestGetBad
   * @summary Just gets a bad request response
   * @request GET:/api/test/badtest
   * @secure
   */
  testGetBad = (params: RequestParams = {}) =>
    this.request<BadRequestModel, any>({
      path: `/api/test/badtest`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
