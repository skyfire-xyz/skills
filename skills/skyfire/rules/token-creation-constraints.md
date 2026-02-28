---
title: Enforce Token Creation Constraints
impact: HIGH
description: Prevents invalid token creation by enforcing TTL, amount, and target constraints from Skyfire docs.
tags: [buyer, tokens, validation, ttl]
---

# Enforce Token Creation Constraints

Token creation must respect type-specific field requirements and strict TTL boundaries.

## ❌ Incorrect

```json
{
  "type": "pay",
  "sellerServiceId": "svc_123",
  "expiresAt": 9999999999
}
```

## ✅ Correct

```json
{
  "type": "pay",
  "sellerServiceId": "350d433d-6ed4-4482-bcfc-14b7da807f9b",
  "tokenAmount": "0.02",
  "expiresAt": 1763769321
}
```

## Key Points

- `type` must be one of `kya`, `pay`, `kya+pay`.
- `tokenAmount` is required for `pay` and `kya+pay`.
- One target is required: `sellerServiceId` or `sellerDomainOrUrl`.
- `expiresAt` is epoch seconds and must be between 10 seconds and 24 hours in the future.
- `tokenAmount` must be greater than zero and satisfy seller minimum token amount constraints.

## Reference

- [Create Token](https://docs.skyfire.xyz/reference/create-token)
- [tokenAmount](https://docs.skyfire.xyz/reference/tokenamount)
- [expiresAt](https://docs.skyfire.xyz/reference/expiresat)
