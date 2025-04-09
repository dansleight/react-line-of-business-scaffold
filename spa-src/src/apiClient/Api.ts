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

import { BadRequestModel, CollectionObject, GlobalSettingsModel, GoodModel } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Api<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Profile
   * @name ProfileGet
   * @request GET:/api/Profile
   */
  profileGet = (params: RequestParams = {}) =>
    this.request<CollectionObject[], string>({
      path: `/api/Profile`,
      method: "GET",
      format: "json",
      ...params,
    });
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
   */
  testGet = (id: number, params: RequestParams = {}) =>
    this.request<GoodModel, BadRequestModel>({
      path: `/api/Test/${id}`,
      method: "GET",
      format: "json",
      ...params,
    });
}
