import type { Intent, IntentStore } from './authoritative';
import { InMemoryIntentStore } from './authoritative';

/**
 * Transport-agnostic, engine-agnostic authoritative log processor.
 *
 * Owns the ordered intent log (via a pluggable `IntentStore`) and exposes
 * `step` (append + return sequence) and read-only queries. It deliberately
 * does NOT import the deterministic `LobbyEngine` or `game.ts` — that keeps
 * the server bundle free of browser-only deps (pixi/phaser) and makes this
 * file safe to bundle into a serverless runtime.
 *
 * State reconstruction from the log is the engine's job, and the engine runs
 * in any context that can bundle `game.ts` (the client browser, a dedicated
 * engine node, the playtest runner, …). The transport-agnostic contract is:
 * the server authoritatively orders intents; any consumer that replays the
 * log through the engine gets the same `AuthoritativeState`.
 */
export interface AuthoritativeProcessorOptions {
	store?: IntentStore;
}

export class AuthoritativeProcessor {
	readonly store: IntentStore;

	constructor(options: AuthoritativeProcessorOptions = {}) {
		this.store = options.store ?? new InMemoryIntentStore();
	}

	/**
	 * Append an intent to the log and return its sequence number (1-based).
	 * Server bundles call this without touching the engine.
	 */
	async step(code: string, intent: Intent): Promise<{ sequence: number }> {
		const sequence = await this.store.append(code, intent);
		return { sequence };
	}

	async has(code: string): Promise<boolean> {
		return this.store.has(code);
	}

	async getLog(code: string): Promise<Intent[]> {
		return this.store.getLog(code);
	}

	async getSequence(code: string): Promise<number> {
		return this.store.getSequence(code);
	}

	async reset(code: string): Promise<void> {
		await this.store.reset(code);
	}
}
