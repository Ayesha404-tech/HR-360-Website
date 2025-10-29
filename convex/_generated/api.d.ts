/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as candidates from "../candidates.js";
import type * as email from "../email.js";
import type * as emailProcessing from "../emailProcessing.js";
import type * as interviews from "../interviews.js";
import type * as kpi_calculateKPI from "../kpi/calculateKPI.js";
import type * as kpi_getKPIs from "../kpi/getKPIs.js";
import type * as kpi_updateKPI from "../kpi/updateKPI.js";
import type * as leaves from "../leaves.js";
import type * as notifications from "../notifications.js";
import type * as payroll from "../payroll.js";
import type * as performance from "../performance.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

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
  ai: typeof ai;
  attendance: typeof attendance;
  auth: typeof auth;
  candidates: typeof candidates;
  email: typeof email;
  emailProcessing: typeof emailProcessing;
  interviews: typeof interviews;
  "kpi/calculateKPI": typeof kpi_calculateKPI;
  "kpi/getKPIs": typeof kpi_getKPIs;
  "kpi/updateKPI": typeof kpi_updateKPI;
  leaves: typeof leaves;
  notifications: typeof notifications;
  payroll: typeof payroll;
  performance: typeof performance;
  reports: typeof reports;
  seed: typeof seed;
  users: typeof users;
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
