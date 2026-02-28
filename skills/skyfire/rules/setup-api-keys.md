---
title: Set Up API Keys and Environment
impact: CRITICAL
description: Prevents auth failures and role-mixing by enforcing correct key and environment setup.
tags: [setup, authentication, api-key, buyer, seller]
---

# Set Up API Keys and Environment

Always configure and use API keys per agent role. Buyer and seller operations should not share the same key.

## ❌ Incorrect

```bash
# Hardcoded key and no environment separation
export SKYFIRE_API_KEY="same-key-for-all-roles"
```

```typescript
// Missing skyfire-api-key header
await fetch("https://api.skyfire.xyz/api/v1/tokens", { method: "POST" });
```

## ✅ Correct

```bash
# Store keys per role and environment
export SKYFIRE_ENV="production" # or sandbox
export SKYFIRE_BUYER_API_KEY="..."
export SKYFIRE_SELLER_API_KEY="..."
```

```typescript
const env = process.env.SKYFIRE_ENV === "sandbox" ? "sandbox" : "production";
const baseUrl = env === "sandbox" ? "https://api-sandbox.skyfire.xyz" : "https://api.skyfire.xyz";
const apiKey = process.env.SKYFIRE_BUYER_API_KEY;
if (!apiKey) throw new Error("Missing buyer API key");

const resp = await fetch(`${baseUrl}/api/v1/tokens`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": apiKey
  },
  body: JSON.stringify({
    type: "kya",
    sellerServiceId: "223bc3eb-9bcb-4e9b-afd6-f26ee0bd3894"
  })
});
```

## Key Points

- Keep buyer and seller keys separate.
- Match production keys to production endpoints and sandbox keys to sandbox endpoints.
- Send `skyfire-api-key` on every authenticated Skyfire request.
- Never hardcode API keys or commit them.

## Reference

- [API Authentication](https://docs.skyfire.xyz/reference/api-authentication)
- [Welcome / Environments](https://docs.skyfire.xyz/reference/welcome)
