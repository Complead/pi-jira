# pi-jira

Jira extension for [pi](https://pi.dev) — sprint management, issue tracking, time logging.

Distributed as a pi package that installs [jira-cli](https://github.com/ankitpokhrel/jira-cli) and provides a skill for seamless integration.

## Installation

```bash
pi install git:github.com/Complead/pi-jira
```

This downloads the `jira-cli` binary to `~/.pi-jira/bin/`.

## First-time Setup

```bash
~/.pi-jira/bin/jira init
```

You'll need:
- Jira instance URL (e.g. `https://yoursite.atlassian.net`)
- Email address
- API token from https://id.atlassian.com/manage-profile/security/api-tokens

## What it does

Once installed, pi will automatically use this tool when you ask about:
- Sprint tasks and status
- Issue details, creation, transitions
- Time logging
- Sprint statistics

## Examples (via pi)

> "покажи задачи текущего спринта"

> "переведи AS-7866 в In Progress"

> "залогай 2 часа на AS-7804"

> "статистика спринта"

## Token Expiry

Atlassian API tokens expire after **1 year**. When auth fails, regenerate at:
https://id.atlassian.com/manage-profile/security/api-tokens

Then run `~/.pi-jira/bin/jira init` again.

## Development

This package doesn't contain its own binary — it wraps [ankitpokhrel/jira-cli](https://github.com/ankitpokhrel/jira-cli).

To update the bundled jira-cli version, edit `JIRA_CLI_VERSION` in `scripts/install-binary.js`.
