# Steam Wishlist Cleanup

Compare your Steam wishlist with the libraries of friends or family members. The tool prints the
games that are both on your wishlist and already available through one of those accounts, then
saves the same list to a timestamped file.

- [Steam Web API](https://steamcommunity.com/dev)
- [Steam Web API documentation](https://steamwebapi.azurewebsites.net/)

## Features

- Fetches your wishlist with the Steam Web API.
- Fetches the owned games of every Steam ID you name.
- Intersects the wishlist with the combined libraries, keeping wishlist order.
- Prints the result and writes `output/results_<timestamp>.txt`.

## Prerequisites

- [mise](https://mise.jdx.dev/) and [just](https://github.com/casey/just) (mise installs `just`).
- A Steam API key from [Steam's API key page](https://steamcommunity.com/dev/apikey).

## Install

```bash
git clone https://github.com/simpsonm09/steam-wishlist-cleanup.git
cd steam-wishlist-cleanup
just install
```

`just install` installs the pinned `just` and `bun` versions from `mise.toml`, then installs the Bun
dev dependencies from the lockfile.

## Usage

```bash
just run
```

The tool prompts for three values:

1. Your Steam API key.
2. Your Steam user ID (the 64-bit `steamID64`, not the account name).
3. The Steam IDs of the family members or friends, comma-separated.

It waits five seconds between Steam API requests, then prints the overlap and saves it to
`output/results_<timestamp>.txt`. `output/` is ignored by Git.

To hardcode the values instead of typing them, set `HARDCODED_API_KEY`, `HARDCODED_USER_ID` and
`HARDCODED_FAMILY_IDS` at the top of `src/main.ts`. Do not commit a real key or Steam IDs.

## Development

```bash
just fmt        # format
just fmt-check  # formatting gate
just lint       # oxlint
just typecheck  # bun check
just test       # bun test
just check      # everything CI requires
```

## Project structure

```text
steam-wishlist-cleanup
├── src
│   ├── main.ts           # interactive entry point
│   ├── steam-api.ts      # Steam Web API calls and parsers
│   ├── utils.ts          # intersection, formatting and file output
│   ├── steam-api.test.ts
│   └── utils.test.ts
├── .github/workflows     # ci.yml and Dependabot automerge
├── justfile              # every command
├── mise.toml             # pinned toolchain
├── package.json          # Bun dev dependencies
└── AGENTS.md             # agent instructions
```

## Contributing

Open an issue or a pull request. `main` changes only through a pull request with the four required
checks passing.

## License

MIT. See [LICENSE](LICENSE).
