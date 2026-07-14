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
import validator from "validator";

const JWKS = createRemoteJWKSet(new URL("https://app.skyfire.xyz/.well-known/jwks.json"));
const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
  issuer: "https://app.skyfire.xyz",
  audience: "<YOUR_SELLER_AGENT_ID>",
  algorithms: ["ES256"]
});

// Header/type checks
if (!["kya+jwt", "pay+jwt", "kya-pay+jwt"].includes(String(protectedHeader.typ))) {
  throw new Error("Unsupported token type");
}

// Core claim checks
const now = Math.floor(Date.now() / 1000);
if (payload.env !== "production") {
  throw new Error("Invalid env claim for production service");
}
if (typeof payload.iat !== "number" || payload.iat > now) {
  throw new Error("Invalid iat");
}
if (typeof payload.exp !== "number" || payload.exp <= now) {
  throw new Error("Token expired");
}
if (!payload.sub || !payload.jti) {
  throw new Error("Missing required claims");
}
if (!validator.isUUID(String(payload.sub)) || !validator.isUUID(String(payload.jti))) {
  throw new Error("sub/jti must be UUIDs");
}

// Example service-targeting checks (adapt to your service)
if (payload.aud !== "<YOUR_SELLER_AGENT_ID>") {
  throw new Error("Audience mismatch");
}

// Pay/KYAPay-specific validations
if (protectedHeader.typ === "pay+jwt" || protectedHeader.typ === "kya-pay+jwt") {
  const amount = Number(payload.amt); // token amount in currency units
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount");
  if (payload.cur !== "USD") throw new Error("Unsupported currency");

  // Optional: enforce price model / price for your seller service
  if (payload.sps !== "<EXPECTED_PRICE_MODEL>") throw new Error("Invalid price model");
  if (payload.spr !== "<EXPECTED_PRICE>") throw new Error("Invalid price");
}
```

## Key Points

- Verify signature with Skyfire JWKS.
- Enforce `iss`, `aud`, `alg`, `exp`, `iat`, `sub`, and `jti`.
- Enforce expected token type (`kya+jwt`, `pay+jwt`, `kya-pay+jwt`).
- Validate `env` (`production` vs `sandbox`) against your deployment environment.
- For pay-capable tokens, validate `amt` (amount in currency units), `cur`, and service pricing claims (`sps`, `spr`).
- Payment claims use short names: `amt`/`val` (amount), `cur` (currency), `sps` (pricing scheme), `spr` (service price), `stp`/`sti` (settlement).
- For sandbox tokens, expect `env` = `sandbox` and issuer/JWKS at `https://app-sandbox.skyfire.xyz`.
- Validate service targeting claims before fulfilling requests.
- Cache JWKS for up to 60 minutes.
- As a seller you can also use the introspect API 

## Reference

- [Verify and Extract Data from Tokens](https://docs.skyfire.xyz/docs/verify-and-extract-data-from-tokens)
- [JWKS Endpoint](https://app.skyfire.xyz/.well-known/jwks.json)
- [Environments](https://docs.skyfire.xyz/reference/environments)
- [Skyfire Kyapay TypeScript Example](https://github.com/skyfire-xyz/kyapay/blob/main/code-examples/verifyKyaPayToken/typescript/src/index.ts)
- [Skyfire Token Introspection](https://docs.skyfire.xyz/reference/introspect-token)
