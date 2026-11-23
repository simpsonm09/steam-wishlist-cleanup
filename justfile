set shell := ["bash", "-euo", "pipefail", "-c"]

# List the recipes.
default:
    @just --list

# Install the pinned tools and the Bun dev dependencies.
install:
    mise install
    bun install --frozen-lockfile

# Format the repository.
fmt:
    bun fmt

# Fail if any file needs formatting.
fmt-check:
    bun fmt --check

# Lint the TypeScript sources.
lint:
    bun x oxlint src

# Type-check the TypeScript sources and tests.
typecheck:
    bun check

# Run the test suite.
test:
    bun test

# Run the tool.
run:
    bun src/main.ts

# Check the agent skill files: frontmatter, recipes and the .claude symlinks.
agent-files:
    bun scripts/agent-files.ts

# Install the repository-local pre-push guard without changing global settings.
hooks:
    #!/usr/bin/env bash
    set -euo pipefail
    existing=$(git config --get core.hooksPath || true)
    if [[ -n "$existing" && "$existing" != .githooks ]]; then
        printf 'Existing hooks path differs; integrate manually rather than replacing it.\n' >&2
        exit 1
    fi
    chmod +x .githooks/pre-push
    git config --local core.hooksPath .githooks
    printf 'Repository-local pre-push guard enabled. No global settings changed.\n'

# Everything a pull request in this repository must pass.
check: fmt-check lint typecheck test agent-files
