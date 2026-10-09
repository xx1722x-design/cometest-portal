/**
 * Cycle-safe JSON stringify. Ability `args` and query options can contain
 * circular back-references (game → grid → hex → creature → game), which
 * `JSON.stringify` rejects with `TypeError: cyclic object value`. This
 * helper drops any value that's part of a cycle (returns `undefined`,
 * which `JSON.stringify` omits) so the message still reaches the server.
 */
const SAFE_KEYS_TO_DROP = new Set(['sourceCreature', 'opt', 'game', 'grid']);

export function safeStringify(value: unknown): string {
	const seen = new WeakSet<object>();
	return JSON.stringify(value, function replacer(this: unknown, key: string, val: unknown) {
		if (typeof val === 'object' && val !== null) {
			if (seen.has(val as object)) {
				return undefined;
			}
			seen.add(val as object);
		}
		// Drop known cyclic offenders (game/grid/creature back-refs embedded
		// in query options and ability args) — they're opaque context the
		// receiver reconstructs from `id`/`target` and doesn't need the
		// live object reference.
		if (SAFE_KEYS_TO_DROP.has(key) && typeof val === 'object' && val !== null) {
			const v = val as Record<string, unknown>;
			if ('id' in v) {
				return { id: v.id };
			}
			return undefined;
		}
		return val;
	});
}
