/** Read expiry timestamp from session store (values in milliseconds). */
export function getStoredExpiry(raw: string | undefined): number {
	if (!raw?.trim()) {
		return 0;
	}

	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) {
		return 0;
	}

	return parsed;
}
