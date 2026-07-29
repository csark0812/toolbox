/** Post-login redirect helper — red-herring surface for investigate outcome suites. */
export function redirectAfterLogin(rawTarget: string | undefined): string {
	if (!rawTarget?.trim()) {
		return "/dashboard";
	}

	const target = rawTarget.trim();
	if (!target.startsWith("/") || target.startsWith("//")) {
		return "/dashboard";
	}

	return target;
}
