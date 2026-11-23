import { afterEach, describe, expect, test } from "bun:test";
import {
  getGameName,
  getLibrary,
  getWishlist,
  gameNameUrl,
  libraryUrl,
  parseGameName,
  parseLibrary,
  parseWishlist,
  wishlistUrl,
} from "./steam-api.ts";

const originalError = console.error;

afterEach(() => {
  console.error = originalError;
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("URLs", () => {
  test("wishlist URL carries the key, Steam ID and format", () => {
    const url = new URL(wishlistUrl("KEY", "7656119"));
    expect(url.origin + url.pathname).toBe(
      "https://api.steampowered.com/IWishlistService/GetWishlist/v1",
    );
    expect(url.searchParams.get("key")).toBe("KEY");
    expect(url.searchParams.get("steamid")).toBe("7656119");
    expect(url.searchParams.get("format")).toBe("json");
  });

  test("library URL keeps the trailing slash of the original endpoint", () => {
    const url = new URL(libraryUrl("KEY", "7656119"));
    expect(url.pathname).toBe("/IPlayerService/GetOwnedGames/v0001/");
    expect(url.searchParams.get("steamid")).toBe("7656119");
  });

  test("game-name URL uses appid", () => {
    const url = new URL(gameNameUrl("KEY", 42));
    expect(url.pathname).toBe("/ISteamUserStats/GetSchemaForGame/v2/");
    expect(url.searchParams.get("appid")).toBe("42");
  });
});

describe("parsers", () => {
  test("wishlist items", () => {
    expect(
      parseWishlist({ response: { items: [{ appid: 1 }, { appid: 2 }] } }),
    ).toEqual([1, 2]);
  });

  test("missing or malformed wishlist items are empty", () => {
    expect(parseWishlist({})).toEqual([]);
    expect(parseWishlist({ response: { items: "nope" } })).toEqual([]);
    expect(
      parseWishlist({ response: { items: [{}, { appid: "1" }] } }),
    ).toEqual([]);
  });

  test("library games", () => {
    expect(parseLibrary({ response: { games: [{ appid: 3 }] } })).toEqual([3]);
    expect(parseLibrary({ response: {} })).toEqual([]);
  });

  test("game name falls back to the app ID", () => {
    expect(parseGameName({ game: { gameName: "Portal" } }, 400)).toBe("Portal");
    expect(parseGameName({}, 400)).toBe("400");
    expect(parseGameName({ game: { gameName: "" } }, 400)).toBe("400");
  });
});

describe("requests", () => {
  test("getWishlist returns the parsed app IDs", async () => {
    const fetchImpl = async () =>
      jsonResponse({ response: { items: [{ appid: 10 }, { appid: 20 }] } });
    expect(await getWishlist("KEY", "ID", fetchImpl)).toEqual([10, 20]);
  });

  test("getLibrary returns the parsed app IDs", async () => {
    const fetchImpl = async () =>
      jsonResponse({ response: { games: [{ appid: 7 }] } });
    expect(await getLibrary("KEY", "ID", fetchImpl)).toEqual([7]);
  });

  test("getGameName returns the name", async () => {
    const fetchImpl = async () => jsonResponse({ game: { gameName: "Hades" } });
    expect(await getGameName("KEY", 1145360, fetchImpl)).toBe("Hades");
  });

  test("a failed request prints the original message and returns nothing", async () => {
    const messages: string[] = [];
    console.error = (message: string) => {
      messages.push(message);
    };
    const fetchImpl = async () => jsonResponse({}, 500);

    expect(await getWishlist("KEY", "ID", fetchImpl)).toEqual([]);
    expect(await getLibrary("KEY", "ID", fetchImpl)).toEqual([]);
    expect(await getGameName("KEY", 5, fetchImpl)).toBe("5");

    expect(messages).toEqual([
      "Error fetching wishlist: HTTP 500 ",
      "Error fetching library for Steam ID ID: HTTP 500 ",
      "Error fetching game name for app ID 5: HTTP 500 ",
    ]);
  });

  test("a rejected request is reported and returns nothing", async () => {
    console.error = () => {};
    const fetchImpl = async () => {
      throw new Error("offline");
    };
    expect(await getWishlist("KEY", "ID", fetchImpl)).toEqual([]);
    expect(await getLibrary("KEY", "ID", fetchImpl)).toEqual([]);
    expect(await getGameName("KEY", 5, fetchImpl)).toBe("5");
  });
});
