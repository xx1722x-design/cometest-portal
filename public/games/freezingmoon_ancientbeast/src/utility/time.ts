import { zfill } from './string';

export const getTimer = (seconds: number) =>
	zfill(Math.floor(seconds / 60), 2) + ':' + zfill(seconds % 60, 2);

/**
 * Async delay that resolves after x ms.
 *
 * @example await sleep(TimeDuration.OneSecond);
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * True when the document is backgrounded/hidden (e.g. an unfocused browser tab).
 * Browsers only throttle (not fully suspend) plain `setTimeout`/`setInterval`
 * while hidden, but they can clamp them down to roughly once per second — and
 * Phaser's tween/game loop rides on the same clock. A multi-step move or
 * ability animation that's normally instantaneous can then take many real
 * seconds to finish playing out on a backgrounded multiplayer client, making
 * that client look painfully slow to catch up even though it isn't stuck.
 */
export const isDocumentHidden = (): boolean =>
	typeof document !== 'undefined' && document.hidden === true;

/**
 * Returns 0 while the document is hidden, otherwise the given duration.
 * Used to collapse purely-cosmetic animation delays/tween durations to
 * instant when nobody can actually see them, so a backgrounded client's game
 * state (turn handoff, movement, ability resolution) doesn't lag behind a
 * throttled render loop just to finish playing an invisible animation.
 */
export const getVisibilityAwareDelay = (ms: number): number => (isDocumentHidden() ? 0 : ms);
