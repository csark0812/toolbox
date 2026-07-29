import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateSessionCookie } from "../src/sessionCookie.ts";

describe("validateSessionCookie", () => {
	it("shows the planted scale bug — valid cookie treated as expired", () => {
		const now = 1_700_000_000_000;
		const cookie = String(now + 3_600_000);
		assert.equal(validateSessionCookie(cookie, now), false);
	});
});
