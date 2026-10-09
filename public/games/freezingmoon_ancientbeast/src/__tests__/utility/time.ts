import { describe, expect, test, afterEach } from '@jest/globals';
import { isDocumentHidden, getVisibilityAwareDelay } from '../../utility/time';

describe('isDocumentHidden / getVisibilityAwareDelay', () => {
	afterEach(() => {
		Object.defineProperty(document, 'hidden', { value: false, configurable: true });
	});

	test('isDocumentHidden reflects document.hidden', () => {
		Object.defineProperty(document, 'hidden', { value: false, configurable: true });
		expect(isDocumentHidden()).toBe(false);

		Object.defineProperty(document, 'hidden', { value: true, configurable: true });
		expect(isDocumentHidden()).toBe(true);
	});

	test('getVisibilityAwareDelay returns the given delay while the tab is visible', () => {
		Object.defineProperty(document, 'hidden', { value: false, configurable: true });
		expect(getVisibilityAwareDelay(350)).toBe(350);
		expect(getVisibilityAwareDelay(0)).toBe(0);
	});

	test('getVisibilityAwareDelay collapses to 0 while the tab is hidden', () => {
		Object.defineProperty(document, 'hidden', { value: true, configurable: true });
		expect(getVisibilityAwareDelay(350)).toBe(0);
		expect(getVisibilityAwareDelay(1000)).toBe(0);
	});
});
