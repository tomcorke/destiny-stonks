import * as bungieApi from "./bungie-api";
import * as bungieAuth from "./bungie-auth";

export interface Api {
  bungieApi: typeof bungieApi;
  bungieAuth: typeof bungieAuth;
}

export type BungieApi = typeof bungieApi;
export type BungieAuth = typeof bungieAuth;

export interface PartialApi {
  bungieApi?: Partial<BungieApi>;
  bungieAuth?: Partial<BungieAuth>;
}

export default {
  bungieApi,
  bungieAuth,
};
