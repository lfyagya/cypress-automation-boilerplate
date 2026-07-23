/**
 * @fileoverview Central command registry.
 * Import every command file here — one place to register all custom commands.
 *
 * Order: core (API engine) → common (auth, nav, ui, table) → modules
 *
 * To add a new module:
 *   import './modules/your-module.commands';
 */

// ─── API Engine ──────────────────────────────────────────────────────────────
import "./core/api";

// ─── Common ──────────────────────────────────────────────────────────────────
import "./commands/common/auth.commands";
import "./commands/common/navigation.commands";
import "./commands/common/ui.commands";
import "./commands/common/table.commands";

// ─── Modules ─────────────────────────────────────────────────────────────────
import "./commands/modules/saucedemo.commands";
