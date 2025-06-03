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

import { HTTPValidationError } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Path<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name ServeSpaPathGet
   * @summary Serve Spa
   * @request GET:/{path}
   * @secure
   */
  serveSpaPathGet = (path: string, params: RequestParams = {}) =>
    this.request<any, HTTPValidationError>({
      path: `/${path}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
