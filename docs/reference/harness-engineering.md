# Harness Engineering — How the AI Layer Actually Works

> **This is the control-plane doc.** [two-views.md](two-views.md) explains the framework from a
> human and an AI perspective. This doc is narrower: it explains the *harness* itself — the
> mechanical scaffolding around Claude Code that makes rule enforcement not depend on the model
> remembering anything — how it's wired, why each piece exists, and what a more mature harness
> (evaluated against a production reference, `fhf-harness-os`) has that this generic boilerplate
> intentionally does or doesn't carry.

A **harness** is the scaffolding that compensates for what the model can't do reliably on its own —
reading instructions is not enforcement, so this framework leaves as little as possible resting on
"the AI will remember." This harness has three layers: **deterministic hooks** (mechanical gates
that can't be talked out of), **role-separated agents** (each with one job, not general-purpose),
and **skill routing** (Cypress's own official skills as the default entry point).

---

## 1. The control plane — hook topology

Hooks wired in `.claude/settings.json`, in the order they actually run:

| Event | Hook | Enforces |
| --- | --- | --- |
| `UserPromptSubmit` | `prompt-duplication-guard.mjs` | Detects create/add/write intent + Cypress context in the prompt, injects a forced "search before creating" instruction |
| `PreToolUse` (`Edit\|Write`) | `pre-validate-cypress-rules.mjs` | Scans the *proposed* content against the 6 shared rules; **blocks the write** (exit 2) on violation |
| `PostToolUse` (`Edit\|Write`) | `validate-cypress-rules.mjs` | Re-scans the *written* content as a safety net; also runs standalone in CI via `--base-ref` |
| `Stop` | `session-end-reminder.mjs` | Checks git status; prints the pre-merge checklist if any `cypress/` file changed this session |

**Exit-code semantics — why this topology actually works, not just looks right on paper:**

- `UserPromptSubmit` writes to **stdout** and exits 0 — stdout is folded into Claude's context, so
  the duplication guard's reminder is something Claude actually reads before acting.
- `PreToolUse` / `PostToolUse` exit **2** with a **stderr** message — exit 2 is the specific code
  Claude Code treats as "feed this back to the model," so the violation text becomes something
  Claude must resolve, not just a log line.
- An exit **1** would only reach the human's terminal, invisible to Claude — it would look like
  enforcement but silently do nothing. None of the four hooks use it for that reason.

This distinction isn't written down anywhere else in the docs — worth internalizing before writing
a fifth hook, because it's the easiest way to ship a hook that appears to work locally and does
nothing.

Rules live once, in `shared-rules.mjs`, consumed by both the pre-write and post-write hook and by
the CI validator — see [hooks-explainer.md](../guides/hooks-explainer.md) for the full event
lifecycle and [ADR 0002](../decisions/0002-claude-code-hooks-as-ai-guardrails.md) for why hooks
were chosen over instructions-only or CI-only enforcement.

---

## 2. Agent topology

Three agents, each bounded to one phase — none of them is a general-purpose assistant:

| Agent | Role | Model pinned | Judgment |
| --- | --- | --- | --- |
| `cypress-bug-hunter` | Debugger | `claude-opus-4-7` | Classifies into 8 failure categories, traces root cause, escalates to a human after 3 failed fix attempts instead of thrashing |
| `pre-merge-qa-gate` | Evaluator / gate | `claude-opus-4-7` | Runs all 6 phases, returns `PASS` / `PASS_WITH_ACTIONS` / `BLOCK` with file:line citations — reports, does not self-repair |
| `pr-creator` | Shipper | inherit | Greps the diff for secret patterns and stops if it finds one; only checks QA-checklist boxes it actually verified |

Authoring itself isn't a fourth agent here — `cypress-author` (the official Cypress AI Toolkit
skill) fills that role, because this is a single generic repo with no cross-repo evidence-gathering
step to justify a dedicated generator agent. See [two-views.md](two-views.md#skills--structured-single-purpose-workflows)
for the skill-vs-agent split, and the [prompting guide](../guides/prompting-guide.md) for when to
reach for which.

---

## 3. Verification loop tiers

| Tier | Mechanism | When | Self-repairing? |
| --- | --- | --- | --- |
| Intra-session | `PreToolUse` block + `PostToolUse` warning | Every file write, live | No — Claude must notice and fix manually |
| Session-end | `session-end-reminder.mjs` | Every Stop event with Cypress changes | No — advisory only |
| Pre-merge | `pre-merge-qa-gate` agent | Before opening a PR | No — returns a verdict, doesn't re-invoke authoring |
| CI | `validate-cypress-rules.mjs --base-ref main` | Every PR touching `cypress/**` or hook config | No — blocks merge, human fixes and re-pushes |

Every tier here **reports or blocks**; none of them **loops**. That's the one structural gap worth
naming plainly: a more mature harness has its gate agent re-invoke the authoring step directly
against its own findings (a bounded retry loop, escalating to a human after a fixed number of
cycles) instead of stopping at a verdict a human then has to act on by hand. Worth adding once this
boilerplate is adapted into a single team's production repo and the PASS/BLOCK cycle shows up often
enough to be worth automating — not worth building speculatively into a generic fork-and-adapt
starting point.

---

## 4. What a more mature harness adds — and whether it belongs here

This section exists because the honest answer to "are we missing anything" is "some things
deliberately, some things not." Evaluated against a production-grade sibling harness running a
larger, multi-repo QA estate:

### Genuinely worth adopting regardless of project size

- **A hook self-test.** Every hook here is untested — a typo in `shared-rules.mjs` fails silently
  the next time someone writes a Cypress file. A single `scripts/test-hooks.mjs` that feeds each
  hook a known-bad and known-good payload via stdin and asserts the exit code would catch hook
  regressions the same way `cypress-rules.yml` catches framework regressions.
- **A governance rule for when a new ADR is required.** Two ADRs exist
  (command-first-over-page-objects, hooks-as-guardrails) but nothing states *when* a third is
  mandatory. A one-paragraph rule — any change to hook topology, the agent roster, or the
  skill-routing map requires an ADR in the same commit — costs nothing and prevents future
  "why does this hook exist" archaeology.
- **The exit-code semantics note above.** It already existed as tribal knowledge in the hook code;
  it wasn't written down anywhere a human would read it before adding hook #5.

### Deliberately not carried over — this is a generic fork target, not a production harness

- **Scenario file/content guards, a coverage-evidence ledger, multi-repo Stop-hook sweeps** — these
  encode one specific project's data shape and repo topology. Porting them here would make every
  team that forks this boilerplate inherit assumptions about *their* app that don't hold.
- **A hard block on spawning generic agents** (`Explore` / `general-purpose`) for Cypress work —
  reasonable in a repo with 4 named agents covering every phase; premature here, where the roster
  is intentionally smaller and skills are still the primary entry point for most tasks.
- **A structured JSON error schema for every tool failure** — valuable at the scale of coordinating
  many agents across sub-repos; `cypress-bug-hunter`'s built-in "3 attempts then escalate" rule
  already covers the one escalation behavior that matters at this scale.
- **Per-agent effort/model overrides beyond what's already pinned** — `cypress-bug-hunter` and
  `pre-merge-qa-gate` already pin `claude-opus-4-7` in their frontmatter for the reasoning-heavy
  work; `pr-creator` correctly inherits, since PR description generation doesn't need the heavier
  model.

---

## 5. If you're adapting this boilerplate into a long-lived production repo

The gap list in §4 is exactly what to revisit first, in this order: write the hook self-test before
adding a fifth hook, write the ADR-required rule before the second engineer joins and starts asking
"why is this here," then — only once PASS/BLOCK verdicts are frequent enough to be a real workflow
cost — consider whether the pre-merge gate should drive its own retry loop instead of stopping at a
report.
