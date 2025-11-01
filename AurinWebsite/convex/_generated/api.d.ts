/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bots from "../bots.js";
import type * as documentation from "../documentation.js";
import type * as documentationSearch from "../documentationSearch.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as meetings from "../meetings.js";
import type * as myFunctions from "../myFunctions.js";
import type * as projects from "../projects.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bots: typeof bots;
  documentation: typeof documentation;
  documentationSearch: typeof documentationSearch;
  http: typeof http;
  integrations: typeof integrations;
  meetings: typeof meetings;
  myFunctions: typeof myFunctions;
  projects: typeof projects;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
