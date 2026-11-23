import { getGameName, getLibrary, getWishlist } from "./steam-api.ts";
import { compareLists, formatResults, saveResultsToFile } from "./utils.ts";

// Hardcoded values (leave undefined to prompt the user).
const HARDCODED_API_KEY: string | undefined = undefined;
const HARDCODED_USER_ID: string | undefined = undefined;
const HARDCODED_FAMILY_IDS: string | undefined = undefined;

// Time to wait between API requests (in seconds).
const DELAY_BETWEEN_REQUESTS = 5;

const sleep = (seconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000));

async function ask(question: string): Promise<string> {
  const answer = prompt(question);
  if (answer === null) {
    throw new Error("no input; run this in a terminal");
  }
  return answer;
}

async function main(): Promise<void> {
  // Use hardcoded values or prompt the user if they are not set.
  const apiKey =
    HARDCODED_API_KEY || (await ask("Enter your Steam API Dev key: "));
  const userId = HARDCODED_USER_ID || (await ask("Enter your Steam User ID: "));
  const familyIds = (
    HARDCODED_FAMILY_IDS ||
    (await ask(
      "Enter the Steam IDs of users in your Steam Family(comma-separated): ",
    ))
  )
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  const wishlist = await getWishlist(apiKey, userId);

  // Add a delay between each API request.
  await sleep(DELAY_BETWEEN_REQUESTS);

  const familyLibraries: number[] = [];
  for (const steamId of familyIds) {
    familyLibraries.push(...(await getLibrary(apiKey, steamId)));
    // Add a delay between each API request.
    await sleep(DELAY_BETWEEN_REQUESTS);
  }

  // Find common games and append their names.
  const commonGames = compareLists(wishlist, familyLibraries);
  const commonGamesWithNames: string[] = [];
  for (const appId of commonGames) {
    const gameName = await getGameName(apiKey, appId);
    commonGamesWithNames.push(`${appId} - ${gameName}`);
    // Add a delay between each API request.
    await sleep(DELAY_BETWEEN_REQUESTS);
  }

  // Print the results, then save them.
  const results = formatResults(commonGamesWithNames);
  for (const line of results) {
    console.log(line);
  }
  await saveResultsToFile(results, `${import.meta.dir}/..`);
}

if (import.meta.main) {
  await main();
}
