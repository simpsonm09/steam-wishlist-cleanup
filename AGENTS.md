# Agent instructions

`steam-wishlist-cleanup` is a small command-line tool. It compares the owner's Steam wishlist with
the libraries of named Steam accounts and writes the overlap to a timestamped text file. It is
TypeScript run by Bun; there is no Python code any more.

## Layout

- `src/main.ts`: the interactive entry point (API key, Steam ID, family Steam IDs).
- `src/steam-api.ts`: the three Steam Web API calls, URL builders and response parsers.
- `src/utils.ts`: the intersection, result formatting and timestamped file writer.
- `src/*.test.ts`: the `bun test` suite.
- `docs/exceptions.md`: rules this repository cannot meet, with reasons and revisit dates.

## Commands

- `just` lists the recipes; `just install` installs the pinned tools and the Bun dev dependencies.
- `just run` runs the tool: `bun src/main.ts`.
- `just fmt` / `just fmt-check` format and verify the repository.
- `just lint` runs `oxlint`; `just typecheck` runs `bun check`; `just test` runs `bun test`.
- `just check` is the gate: `fmt-check`, `lint`, `typecheck`, `test` and `agent-files`.
- `just hooks` installs `.githooks/pre-push` for this clone only.

## Invariants

- **Same behaviour as the original tool.** The prompts, the Steam endpoints, the five-second delay
  between requests, the two result sentences and the `output/results_<timestamp>.txt` path stay as
  they are. Change them only on an explicit owner request.
- A failed Steam request prints the original error sentence and contributes no items; it does not
  abort the run. Keep that fail-soft behaviour.
- The tool reads the API key from the prompt. Never commit a key, a real Steam ID, or a file from
  `output/`.
- Steam's Web API terms apply: keep request volume low and do not add retries that hammer the API.

## Never

- Push to `main`. It is a public repository with the `protect-main` ruleset: work on a branch and
  merge a pull request.
- Change GitHub settings, repository visibility or access from a workflow, script or agent run.
- Add a dependency that a stdlib or Bun built-in can replace, and do not add a `lint` script to
  `package.json`: `bun lint` would run it instead of the linter.
