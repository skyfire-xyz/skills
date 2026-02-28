---
title: Choose the Right Token Type
impact: HIGH
description: Prevents incorrect token usage by mapping use cases to kya, pay, and kya+pay token types.
tags: [tokens, kya, pay, kyapay, design]
---

# Choose the Right Token Type

Pick token type based on the seller service requirement and endpoint behavior.

## ❌ Incorrect

```typescript
// Seller endpoint requires identity claim checks but this omits identity
const body = {
  type: "pay",
  tokenAmount: "5.00",
  sellerServiceId: "svc_data_feed"
};
```

## ✅ Correct

```typescript
// Identity only (KYA): use for auth/account creation flows
const kyaTokenRequest = {
  type: "kya",
  sellerServiceId: "svc_restricted_content",
  identityPermissions: ["nameFirst", "nameLast", "phoneNumber"]
};

// Payment only (PAY): use for payment-only calls
const payTokenRequest = {
  type: "pay",
  tokenAmount: "5.00",
  sellerServiceId: "svc_data_feed"
};

// Identity + payment (KYA+PAY): use for paid + identity-gated calls
const kyaPayTokenRequest = {
  type: "kya+pay",
  tokenAmount: "5.00",
  sellerServiceId: "svc_premium_api",
  identityPermissions: ["selectedCountryCode", "birthdate"]
};
```

## Key Points

- Use `kya` when seller requires identity claims only.
- Use `pay` when seller requires only payment and no identity fields.
- Use `kya+pay` when seller requires both identity and payment claims.
- Check seller service `acceptedTokens` and identity requirements before choosing token type.

## Reference

- [Token Types Overview](https://docs.skyfire.xyz/docs/explore-products)
- [Create Token](https://docs.skyfire.xyz/reference/create-token)
