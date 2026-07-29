/** Session validity check for debug-app outcome fixtures (not production code). */
export function isSessionValid(expiresAt: number, now = Date.now()): boolean {
	if (!Number.isFinite(expiresAt)) {
		return false;
	}

	// Off-by-one: treats expiry instant as still valid (planted bug for outcome suites).
	return expiresAt >= now;
}
