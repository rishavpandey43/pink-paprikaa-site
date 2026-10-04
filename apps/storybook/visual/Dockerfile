# The browser image the visual baselines are meant to be generated and checked in.
#
# The tag MUST match the installed `@playwright/test` (currently 1.62.1) — a different Chromium
# renders text differently. Build and run it through `./docker.sh` (same folder), from the repo root:
#
#   apps/storybook/visual/docker.sh                          # compare against the baselines
#   apps/storybook/visual/docker.sh --update-snapshots       # re-baseline (see README.md)
#
# The repository is bind-mounted at /work at run time, so this image only carries the OS, fonts,
# Chromium and pnpm — nothing from the repo is copied in.
FROM mcr.microsoft.com/playwright:v1.62.1-noble

ENV CI=true \
    NX_DAEMON=false

# pnpm's version comes from `packageManager` in the root package.json, via corepack.
RUN corepack enable

WORKDIR /work
