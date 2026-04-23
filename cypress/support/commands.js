/**
 * @fileoverview Central command registry.
 * Import every command file here — one place to register all custom commands.
 *
 * Order: core (auth, nav, ui) → common (filter, form, table) → modules
 *
 * To add a new module:
 *   import './modules/your-module.commands';
 */

// ─── API Engine ──────────────────────────────────────────────────────────────
import "./core/api";

// ─── Core ────────────────────────────────────────────────────────────────────
import "./commands/common/auth.commands";
import "./commands/common/navigation.commands";
import "./commands/common/ui.commands";

// ─── Common ──────────────────────────────────────────────────────────────────
import "./commands/common/filter.commands";
import "./commands/common/form.commands";
import "./commands/common/table.commands";

// ─── Modules ─────────────────────────────────────────────────────────────────
import "./commands/modules/example.commands";
import "./commands/modules/saucedemo.commands";
