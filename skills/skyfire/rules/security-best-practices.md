---
title: Apply Skyfire Security Best Practices
impact: CRITICAL
description: Reduces fraud and leakage risks with strict JWT validation, least-privilege claims, and safe token handling.
tags: [security, validation, identity, payments, reliability]
---

# Apply Skyfire Security Best Practices

Treat all token operations as security-sensitive and payment-sensitive.

## ❌ Incorrect

```typescript
// Long-lived token + overbroad identity permission request
const payload = {
  type: "kya+pay",
  tokenAmount: "20.00",
  identityPermissions: ["*"],
  expiresAt: 9999999999
};
```

## ✅ Correct

```typescript
const now = Math.floor(Date.now() / 1000);
const expiresAt = now + 10 * 60; // 10 minutes

const payload = {
  type: "kya+pay",
  buyerTag: "order-123",
  sellerServiceId: "350d433d-6ed4-4482-bcfc-14b7da807f9b",
  tokenAmount: "2.00",
  identityPermissions: ["nameFirst", "nameLast"], // least privilege
  expiresAt
};
```

```python
def require_token_from_header(request):
    token = request.headers.get("skyfire-pay-id")
    if not token:
        raise PermissionError("Missing payment token")
    return token
```

## Key Points

- Verify JWT signature with Skyfire JWKS and enforce expected `iss`, `aud`, `alg`, `typ`, `exp`, and `iat`.
- Cache JWKS for up to 60 minutes as recommended.
- Use short expiration windows (10s to 24h for token creation).
- Request only minimum identity fields required by business logic.
- Validate token on every protected request and ensure service targeting claims match your service.
- Do not log raw tokens in plaintext logs.
- Fail closed on verification/charge API errors.

## Reference

- [HTTP Error Status Codes](https://docs.skyfire.xyz/reference/http-error-status-codes)
- [Verify and Extract Data from Tokens](https://docs.skyfire.xyz/reference/verify-and-extract-data-from-tokens)
- [JWKS Endpoint](https://app.skyfire.xyz/.well-known/jwks.json)
