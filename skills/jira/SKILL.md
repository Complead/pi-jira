---
name: jira
description: Manage Jira issues — view sprint, list tasks, transition issues, log time. Use when user asks about Jira tasks, sprint status, wants to move or update issues, or log work time.
---

# jira — Jira CLI Tool

Manages Jira issues via [jira-cli](https://github.com/ankitpokhrel/jira-cli).

## Binary & Wrapper

The binary is installed at `~/.pi-jira/bin/jira` (or `jira.exe` on Windows).

**All commands MUST be run through the wrapper** to inject the API token:

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js <args>
```

The wrapper reads the token from `~/.pi-jira/.token` and sets `JIRA_API_TOKEN` env var automatically.

## First-time Setup

If not configured yet, run:

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/setup.js
```

This will ask for:
- API token (from https://id.atlassian.com/manage-profile/security/api-tokens)
- Then launches `jira init` which asks for:
  - Jira server URL (e.g. `https://adsensor-ru.atlassian.net`)
  - Login email
  - Default project (e.g. `AS`)
  - Default board

Token is stored in `~/.pi-jira/.token` (isolated, not global env).
Config is stored in `~/.config/.jira/.config.yml`

## Usage

### Current sprint issues

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js sprint list --current
```

### My issues

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js issue list --assignee "$(node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js me)" --status "In Progress"
```

### Search with JQL

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js issue list --jql "project = \"AS\" AND sprint in openSprints()" --plain --columns key,summary,status,assignee
```

### View issue details

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js issue view AS-7866 --plain
```

### Move issue (transition)

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js issue move AS-7866 "In Progress"
```

### Log time

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js issue worklog add AS-7866 "2h" --comment "implemented feature X"
```

### Add comment

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js issue comment add AS-7866 "Done, deployed to staging"
```

### Create issue

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js issue create --type Task --summary "New task title" --priority High
```

### Sprint stats (custom JQL)

To get sprint statistics, query all issues and count by status:

```bash
node ~/.pi/agent/git/github.com/Complead/pi-jira/scripts/run.js issue list --jql "project = \"AS\" AND sprint in openSprints()" --plain --no-headers --columns status | sort | uniq -c | sort -rn
```

## Flags Reference

| Flag | Description |
|------|-------------|
| `--plain` | Plain text output (no colors/formatting) — use for parsing |
| `--no-headers` | Omit column headers |
| `--columns` | Comma-separated column names: key, summary, status, assignee, priority, type, created, updated |
| `--jql` | Custom JQL query |
| `--project` | Override default project |
| `--type` | Issue type: Task, Bug, Story, Sub-task |
| `--priority` | Priority: Highest, High, Medium, Low, Lowest |
| `--assignee` | Filter by assignee |
| `--status` | Filter by status |

## Guidelines

- Always use `--plain` when processing output programmatically
- Use `--plain --no-headers --columns` for clean parseable output
- Quote JQL strings properly — escape inner quotes with backslash
- When user says "мой спринт" or "мои задачи" — filter by current user
- When user asks for stats — use JQL + count by status
- For issue transitions, use exact status names from the project workflow
- API token expires after 1 year — if auth fails, suggest regenerating at https://id.atlassian.com/manage-profile/security/api-tokens
