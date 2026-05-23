# Repository Guidelines

## Overview

`pi-jira` is a Jira integration for [pi](https://pi.dev) — sprint management, issue tracking, time logging via [jira-cli](https://github.com/ankitpokhrel/jira-cli). It's distributed as a pi package (skill + auto-installed binary).

## Development

- Install dependencies: binary is auto-installed via `scripts/install-binary.js` on `npm install`
- Test locally: `~/.pi-jira/bin/jira issue list --plain`
- Release: tag with `vX.Y.Z` and push — GitHub Actions handles publishing

## Rules

- **Do not commit or push without explicit user approval.**
- **Do not create tags or releases without explicit user approval.**
