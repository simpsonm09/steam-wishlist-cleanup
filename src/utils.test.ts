import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  compareLists,
  formatResults,
  resultFileName,
  saveResultsToFile,
} from "./utils.ts";

const originalLog = console.log;

afterEach(() => {
  console.log = originalLog;
});

describe("compareLists", () => {
  test("keeps wishlist order and drops duplicates", () => {
    expect(compareLists([3, 1, 2, 1], [2, 3])).toEqual([3, 2]);
  });

  test("returns nothing when the lists do not overlap", () => {
    expect(compareLists([1, 2], [3, 4])).toEqual([]);
    expect(compareLists([], [1])).toEqual([]);
  });
});

describe("formatResults", () => {
  test("writes the header and one line per game", () => {
    expect(formatResults(["10 - Portal", "20 - Hades"])).toEqual([
      "Games in both your wishlist and available via family library:",
      "10 - Portal",
      "20 - Hades",
    ]);
  });

  test("writes the no-overlap sentence", () => {
    expect(formatResults([])).toEqual([
      "No common games found in your wishlist and any family library.",
    ]);
  });
});

describe("resultFileName", () => {
  test("is the local-time timestamped name the Python helper used", () => {
    expect(resultFileName(new Date(2026, 10, 23, 9, 5, 7))).toBe(
      "results_2026-11-23_09-05-07.txt",
    );
    expect(resultFileName(new Date(2026, 0, 2, 23, 59, 0))).toBe(
      "results_2026-01-02_23-59-00.txt",
    );
  });
});

describe("saveResultsToFile", () => {
  test("creates output/ and writes newline-separated results", async () => {
    const baseDir = await mkdtemp(join(tmpdir(), "wishlist-"));
    const printed: string[] = [];
    console.log = (message: string) => {
      printed.push(message);
    };
    try {
      const path = await saveResultsToFile(
        ["header", "10 - Portal"],
        baseDir,
        new Date(2026, 10, 23, 9, 5, 7),
      );
      expect(path).toBe(
        join(baseDir, "output", "results_2026-11-23_09-05-07.txt"),
      );
      expect(await readFile(path, "utf8")).toBe("header\n10 - Portal");
      expect(printed).toEqual([`Results saved to ${path}`]);
    } finally {
      await rm(baseDir, { recursive: true, force: true });
    }
  });
});
