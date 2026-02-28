---
title: Verify JWT Claims with JWKS
impact: CRITICAL
description: Prevents accepting forged or mis-targeted tokens by enforcing signature and claim validation.
tags: [jwt, jwks, validation, claims, seller]
---

# Verify JWT Claims with JWKS

Skyfire tokens are signed JWTs. Sellers should verify signature and required claims before granting access.

## ❌ Incorrect

```typescript
// Decodes token but never verifies signature/issuer/audience
const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"));
if (payload.exp > Date.now() / 1000) allowRequest();
```

## ✅ Correct

```typescript
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL("https://app.skyfire.xyz/.well-known/jwks.json"));
const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
  issuer: "https://app.skyfire.xyz",
  audience: "<YOUR_SELLER_AGENT_ID>",
  algorithms: ["ES256"]
});

// Enforce additional Skyfire claim checks based on token type and service targeting.
if (!payload.exp || !payload.iat || !payload.sub || !payload.jti) {
  throw new Error("Missing required claims");
}
if (!["kya+JWT", "pay+JWT", "kya+pay+JWT"].includes(String(protectedHeader.typ))) {
  throw new Error("Unsupported token type");
}
```

## Key Points

- Verify signature with Skyfire JWKS.
- Enforce `iss`, `aud`, `alg`, `exp`, `iat`, `sub`, and `jti`.
- Enforce expected token type (`kya+JWT`, `pay+JWT`, `kya+pay+JWT`).
- Validate service targeting claims before fulfilling requests.
- Cache JWKS for up to 60 minutes.

## Reference

- [Verify and Extract Data from Tokens](https://docs.skyfire.xyz/reference/verify-and-extract-data-from-tokens)
- [JWKS Endpoint](https://app.skyfire.xyz/.well-known/jwks.json)
- [Welcome / Environments](https://docs.skyfire.xyz/reference/welcome)
