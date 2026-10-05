# Billing log investigation

The billing job's logs are missing. Two read attempts were already made:

1. `agentctl logs billing` returned `403: token lacks logs:read`.
2. The alternate read client returned the same `403: token lacks logs:read` for the same account.

No logs or billing application source were returned. The agent has no other authorized account or credential. These attempts establish an access blocker, not the cause of the missing logs.
