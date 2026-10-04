#!/usr/bin/env sh
# Runs the visual suite inside the Playwright image the baselines are meant to be made in.
#
#   apps/storybook/visual/docker.sh                       # compare
#   apps/storybook/visual/docker.sh --update-snapshots    # re-baseline every story
#   apps/storybook/visual/docker.sh --grep atoms-button-- # one component's stories
#
# Extra arguments go straight to `playwright test` (through `nx run storybook:visual --`).
# Run it from anywhere; it resolves the repository root itself. Needs Docker.
set -eu

here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../../.." && pwd)"
image="pink-paprikaa-visual"

# Keep the image tag in step with the installed Playwright; fail loudly if the Dockerfile drifts.
installed="$(node -p "require('$root/node_modules/@playwright/test/package.json').version")"
if ! grep -q "playwright:v${installed}-noble" "$here/Dockerfile"; then
  echo "visual/Dockerfile does not use mcr.microsoft.com/playwright:v${installed}-noble" >&2
  exit 1
fi

docker build --quiet -t "$image" -f "$here/Dockerfile" "$here"

# The repo is mounted read-only at /src and copied (without node_modules, .git or build output) to
# /work inside the container, so the Linux `pnpm install` can never touch the host's node_modules.
# Only the screenshot folder is copied back out (it changes only with --update-snapshots).
docker run --rm --ipc=host \
  -v "$root":/src:ro \
  -v "$here/__screenshots__":/out \
  -w /work \
  "$image" \
  sh -c '
    set -eu
    mkdir -p /work
    tar -C /src --exclude=node_modules --exclude=.git --exclude=.nx --exclude=storybook-static \
        --exclude=.next -cf - . | tar -C /work -xf -
    pnpm install --frozen-lockfile
    status=0
    pnpm nx run storybook:visual -- "$@" || status=$?
    cp -R apps/storybook/visual/__screenshots__/. /out/
    exit $status
  ' sh "$@"
