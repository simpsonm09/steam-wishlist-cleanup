import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/** App IDs present in both lists, in wishlist order and without duplicates. */
export function compareLists(wishlist: number[], library: number[]): number[] {
  const owned = new Set(library);
  return [...new Set(wishlist)].filter((appId) => owned.has(appId));
}

/** The two possible result blocks, matching the original wording. */
export function formatResults(commonGames: string[]): string[] {
  if (commonGames.length === 0) {
    return ["No common games found in your wishlist and any family library."];
  }
  return [
    "Games in both your wishlist and available via family library:",
    ...commonGames,
  ];
}

/** Local-time `results_YYYY-MM-DD_HH-MM-SS.txt`, as the Python helper wrote it. */
export function resultFileName(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
  const clock = [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("-");
  return `results_${stamp}_${clock}.txt`;
}

/**
 * Writes the results to `output/results_<timestamp>.txt` and returns the path.
 * `baseDir` is injectable so the test does not write into the repository.
 */
export async function saveResultsToFile(
  results: string[],
  baseDir: string,
  date: Date = new Date(),
): Promise<string> {
  const outputFolder = join(baseDir, "output");
  await mkdir(outputFolder, { recursive: true });
  const filename = join(outputFolder, resultFileName(date));
  await writeFile(filename, results.map(String).join("\n"));
  console.log(`Results saved to ${filename}`);
  return filename;
}
