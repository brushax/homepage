# Selfhost Fork Notes

This fork keeps custom Homepage changes on `selfhost/dev` instead of trying to meet upstream feature-gating requirements.

## Branch

- `selfhost/dev`: long-lived branch for fork-only changes such as the custom Navidrome and ArchiSteamFarm widgets.

## Image Publishing

- Workflow: `.github/workflows/selfhost-image.yml`
- Registry: `ghcr.io/<owner>/homepage`
- Useful tags:
  - `selfhost`
  - `sha-<commit>`
  - sanitized branch tag, for example `selfhost-dev`

Pushing to `selfhost/dev` will build and publish the image automatically.

## Upstream Sync

- Script: `tools/sync-upstream.sh`
- Workflow: `.github/workflows/selfhost-sync.yml`
- Strategy: `rebase selfhost/dev onto upstream/dev`

Local usage:

```bash
./tools/sync-upstream.sh
```

The script intentionally fails on rebase conflicts so they can be resolved manually.

## GitHub Actions Caveat

GitHub only runs `schedule` and exposes `workflow_dispatch` from workflow files that exist on the repository's default branch.

If you want the scheduled selfhost workflows to run from this fork, either:

1. set the fork default branch to `selfhost/dev`, or
2. copy the selfhost workflow files onto the fork's default branch as well.
