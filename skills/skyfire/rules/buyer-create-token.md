---
title: Create Buyer Tokens Correctly
impact: CRITICAL
description: Ensures buyer agents create valid tokens with required fields and practical expiration windows.
tags: [buyer, create-token, api, token-lifecycle]
---

# Create Buyer Tokens Correctly

Buyer agents should create tokens with explicit type, target seller, and valid TTL constraints.

## ❌ Incorrect

```python
# Missing seller target and tokenAmount for pay token
payload = {"type": "pay", "expiresAt": 0}
```

```typescript
// Wrong endpoint + missing JSON headers
await fetch("https://api.skyfire.xyz/tokens", { method: "POST" });
```

## ✅ Correct

```python
import os
import requests
import time

api_key = os.environ["SKYFIRE_BUYER_API_KEY"]
expires_at = int(time.time()) + (20 * 60)  # epoch seconds

payload = {
    "type": "kya+pay",
    "buyerTag": "agent-123",
    "tokenAmount": "3.50",
    "sellerServiceId": "svc_financial_data",
    "expiresAt": expires_at,
    "identityPermissions": ["nameFirst", "nameLast"]
}

response = requests.post(
    "https://api.skyfire.xyz/api/v1/tokens",
    headers={
        "skyfire-api-key": api_key,
        "content-type": "application/json"
    },
    json=payload,
    timeout=20
)
response.raise_for_status()
token = response.json()["token"]
```

## Key Points

- Use `POST /api/v1/tokens`.
- For `pay` and `kya+pay`, include `tokenAmount`.
- Provide one target selector: `sellerServiceId` or `sellerDomainOrUrl`.
- `expiresAt` is Unix epoch seconds and must be between 10 seconds and 24 hours in the future.
- Persist only what you need; treat token material as sensitive.

## Reference

- [Create Token API](https://docs.skyfire.xyz/reference/create-token)
- [expiresAt](https://docs.skyfire.xyz/reference/expiresat)
- [tokenAmount](https://docs.skyfire.xyz/reference/tokenamount)
