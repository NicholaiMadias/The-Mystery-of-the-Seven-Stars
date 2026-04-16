/**
 * Nexus OS — Route Definitions
 *
 * The app uses an internal view-state router (no React Router dependency).
 * This module documents every named view and provides helper utilities for
 * navigation, deep-link query-string parsing, and view metadata.
 */

export const VIEWS = {
  OVERWORLD: 'overworld',
  TELEMETRY: 'telemetry',
  STORE: 'store',
  MULTIPLAYER: 'multiplayer',
  RESUME: 'resume',
  TERMINAL: 'terminal',
};

/** Ordered dock navigation entries. */
export const DOCK_ROUTES = [
  { view: VIEWS.OVERWORLD, label: 'Map' },
  { view: VIEWS.STORE, label: 'Store' },
  { view: VIEWS.MULTIPLAYER, label: 'Arena' },
  { view: VIEWS.RESUME, label: 'Shard' },
  { view: VIEWS.TERMINAL, label: 'Term' },
];

/** Sidebar navigation entries. */
export const SIDEBAR_ROUTES = [
  { view: VIEWS.TELEMETRY, label: 'OS Telemetry' },
  { view: VIEWS.STORE, label: 'Power Store' },
  { view: VIEWS.MULTIPLAYER, label: 'Multiplayer' },
  { view: VIEWS.RESUME, label: 'Master Shard' },
  { view: VIEWS.TERMINAL, label: 'OS Terminal' },
];

/** Terminal command → view mapping. */
export const TERMINAL_COMMANDS = {
  telemetry: VIEWS.TELEMETRY,
  resume: VIEWS.RESUME,
  store: VIEWS.STORE,
  multiplayer: VIEWS.MULTIPLAYER,
  mp: VIEWS.MULTIPLAYER,
};

/**
 * Read the initial view from the URL query string.
 * e.g. /?view=terminal → 'terminal'
 * Falls back to OVERWORLD if the param is absent or unrecognised.
 */
export function getInitialView() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('view');
  const valid = Object.values(VIEWS);
  return valid.includes(requested) ? requested : VIEWS.OVERWORLD;
}
