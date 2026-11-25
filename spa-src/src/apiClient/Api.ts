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
  ApiError,
  GlobalSettingsModel,
  GoodModel,
  LookupModel,
  LookupType,
  UserInfoModel,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Info
   * @name GetUserInfo
   * @request GET:/api/info
   * @secure
   */
  getUserInfo = (params: RequestParams = {}) =>
    this.request<UserInfoModel, ApiError>({
      path: `/api/info`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Info
   * @name GetUserAvatar
   * @summary Gets the current user's avatar (Graph, then Gravatar, then initials). Cached for seven days.
   * @request GET:/api/info/avatar
   * @secure
   */
  getUserAvatar = (params: RequestParams = {}) =>
    this.request<File, ApiError>({
      path: `/api/info/avatar`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Info
   * @name RefreshUserAvatar
   * @summary Forces a refresh of the current user's avatar from Graph / Gravatar / initials.
   * @request POST:/api/info/avatar/refresh
   * @secure
   */
  refreshUserAvatar = (params: RequestParams = {}) =>
    this.request<File, ApiError>({
      path: `/api/info/avatar/refresh`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Lookup
   * @name LookupAll
   * @request GET:/api/lookup
   * @secure
   */
  lookupAll = (params: RequestParams = {}) =>
    this.request<LookupModel[], ApiError>({
      path: `/api/lookup`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Lookup
   * @name LookupType
   * @request GET:/api/lookup/type/{lookupType}
   * @secure
   */
  lookupType = (lookupType: LookupType, params: RequestParams = {}) =>
    this.request<LookupModel, ApiError>({
      path: `/api/lookup/type/${lookupType}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Settings
   * @name GetSettings
   * @summary Gets the global settings necessary for the SPA to start, including MSAL settings for Authentication
   * @request GET:/api/settings
   */
  getSettings = (params: RequestParams = {}) =>
    this.request<GlobalSettingsModel, ApiError>({
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
    this.request<GoodModel, ApiError>({
      path: `/api/test/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
