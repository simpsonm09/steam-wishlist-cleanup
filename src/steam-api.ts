// Steam Web API access. The endpoints and error handling match the original
// Python helpers: a failed request prints the same message and yields no items.

const STEAM_API_BASE_URL = "https://api.steampowered.com";

export type FetchLike = (url: string) => Promise<Response>;

export function wishlistUrl(apiKey: string, steamId: string): string {
  const params = new URLSearchParams({
    key: apiKey,
    steamid: steamId,
    format: "json",
  });
  return `${STEAM_API_BASE_URL}/IWishlistService/GetWishlist/v1?${params}`;
}

export function libraryUrl(apiKey: string, steamId: string): string {
  const params = new URLSearchParams({
    key: apiKey,
    steamid: steamId,
    format: "json",
  });
  return `${STEAM_API_BASE_URL}/IPlayerService/GetOwnedGames/v0001/?${params}`;
}

export function gameNameUrl(apiKey: string, appId: number): string {
  const params = new URLSearchParams({
    key: apiKey,
    appid: String(appId),
    format: "json",
  });
  return `${STEAM_API_BASE_URL}/ISteamUserStats/GetSchemaForGame/v2/?${params}`;
}

async function getJson(url: string, fetchImpl: FetchLike): Promise<unknown> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export function parseWishlist(data: unknown): number[] {
  const items = (data as { response?: { items?: Array<{ appid?: number }> } })
    .response?.items;
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => item.appid)
    .filter((appId): appId is number => typeof appId === "number");
}

export function parseLibrary(data: unknown): number[] {
  const games = (data as { response?: { games?: Array<{ appid?: number }> } })
    .response?.games;
  if (!Array.isArray(games)) return [];
  return games
    .map((game) => game.appid)
    .filter((appId): appId is number => typeof appId === "number");
}

export function parseGameName(data: unknown, appId: number): string {
  const name = (data as { game?: { gameName?: unknown } }).game?.gameName;
  return typeof name === "string" && name.length > 0 ? name : String(appId);
}

/** App IDs in the user's wishlist. A failed request prints and returns []. */
export async function getWishlist(
  apiKey: string,
  steamId: string,
  fetchImpl: FetchLike = fetch,
): Promise<number[]> {
  try {
    return parseWishlist(
      await getJson(wishlistUrl(apiKey, steamId), fetchImpl),
    );
  } catch (error) {
    console.error(`Error fetching wishlist: ${describeError(error)}`);
    return [];
  }
}

/** App IDs owned by a Steam account. A failed request prints and returns []. */
export async function getLibrary(
  apiKey: string,
  steamId: string,
  fetchImpl: FetchLike = fetch,
): Promise<number[]> {
  try {
    return parseLibrary(await getJson(libraryUrl(apiKey, steamId), fetchImpl));
  } catch (error) {
    console.error(
      `Error fetching library for Steam ID ${steamId}: ${describeError(error)}`,
    );
    return [];
  }
}

/** The game name, or the app ID when the name cannot be fetched. */
export async function getGameName(
  apiKey: string,
  appId: number,
  fetchImpl: FetchLike = fetch,
): Promise<string> {
  try {
    const data = await getJson(gameNameUrl(apiKey, appId), fetchImpl);
    return parseGameName(data, appId);
  } catch (error) {
    console.error(
      `Error fetching game name for app ID ${appId}: ${describeError(error)}`,
    );
    return String(appId);
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
