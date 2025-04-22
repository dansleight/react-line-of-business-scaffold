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
   * @request GET:/api/Settings
   */
  settingsGet = (params: RequestParams = {}) =>
    this.request<GlobalSettingsModel, any>({
      path: `/api/Settings`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Test
   * @name TestGet
   * @request GET:/api/Test/{id}
   * @secure
   */
  testGet = (id: number, params: RequestParams = {}) =>
    this.request<GoodModel, BadRequestModel>({
      path: `/api/Test/${id}`,
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
   * @request GET:/api/Widget
   * @secure
   */
  widgetGet = (params: RequestParams = {}) =>
    this.request<WidgetObject[], any>({
      path: `/api/Widget`,
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
   * @request POST:/api/Widget
   * @secure
   */
  widgetAdd = (data: AddWidgetModel, params: RequestParams = {}) =>
    this.request<WidgetObject, any>({
      path: `/api/Widget`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
