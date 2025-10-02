// Pre-compile regex pattern strings at module level for performance
// Valid string terminator sequences are BEL, ESC\, and 0x9c
const ST = '(?:\\u0007|\\u001B\\u005C|\\u009C)';

// OSC sequences only: ESC ] ... ST (non-greedy until the first ST)
const osc = `(?:\\u001B\\][\\s\\S]*?${ST})`;

// CSI and related: ESC/C1, optional intermediates, optional params (supports ; and :) then final byte
// Optimized: More specific character classes and structure for better performance
const csi = '[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]';

// Build and cache the complete pattern string
const PATTERN_STRING = `${osc}|${csi}`;

// Pre-compiled regex objects - these are reused for better performance
// Note: For global flag, we clone to avoid lastIndex issues
const CACHED_REGEX_GLOBAL = new RegExp(PATTERN_STRING, 'g');
const CACHED_REGEX_SINGLE = new RegExp(PATTERN_STRING);

export default function ansiRegex({onlyFirst = false} = {}) {
	if (onlyFirst) {
		// For non-global regex, we can safely return the cached version
		// since it doesn't maintain state
		return CACHED_REGEX_SINGLE;
	}

	// For global regex, clone it to avoid lastIndex state issues
	// This is still faster than creating from pattern string
	return new RegExp(CACHED_REGEX_GLOBAL.source, 'g');
}
