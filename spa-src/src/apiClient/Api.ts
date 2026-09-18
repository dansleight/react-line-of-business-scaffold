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
   * @name InfoGetUserInfoModel
   * @request GET:/api/info
   * @secure
   */
  infoGetUserInfoModel = (params: RequestParams = {}) =>
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
   * @tags Settings
   * @name SettingsGet
   * @summary Gets the global settings necessary for the SPA to start, including MSAL settings for Authentication
   * @request GET:/api/settings
   */
  settingsGet = (params: RequestParams = {}) =>
    this.request<GlobalSettingsModel, ApiError>({
      path: `/api/settings`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Settings
   * @name SettingsAvatar
   * @summary Gets the current user's avatar (Graph, then Gravatar, then initials). Cached for seven days.
   * @request GET:/api/settings/avatar
   * @secure
   */
  settingsAvatar = (params: RequestParams = {}) =>
    this.request<File, ApiError>({
      path: `/api/settings/avatar`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Settings
   * @name SettingsRefreshAvatar
   * @summary Forces a refresh of the current user's avatar from Graph / Gravatar / initials.
   * @request POST:/api/settings/avatar/refresh
   * @secure
   */
  settingsRefreshAvatar = (params: RequestParams = {}) =>
    this.request<File, ApiError>({
      path: `/api/settings/avatar/refresh`,
      method: "POST",
      secure: true,
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
