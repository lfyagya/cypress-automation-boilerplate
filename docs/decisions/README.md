# Architecture Decision Records

This folder contains Architecture Decision Records (ADRs) — an append-only log of significant technical decisions made in this framework.

## Format

Each ADR is a numbered Markdown file: `NNNN-short-title.md`

```text
# NNNN — Decision Title

## Status
Accepted | Superseded by NNNN | Deprecated

## Context
What situation or constraint forced a decision?

## Decision
What was decided?

## Consequences
What becomes easier? What becomes harder?
```

## Rules

- Never modify an existing ADR — write a new one that supersedes it
- Number sequentially: `0001`, `0002`, ...
- One decision per file — keep scope narrow
- Update `Status` to `Superseded by NNNN` if a later ADR replaces this one
