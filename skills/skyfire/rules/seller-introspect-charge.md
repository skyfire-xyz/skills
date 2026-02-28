---
title: Use Introspection and Charge Correctly
impact: CRITICAL
description: Prevents unsafe token acceptance by using introspection before charging and returning consistent status codes.
tags: [seller, introspect, charge, payments, backend]
---

# Use Introspection and Charge Correctly

Seller services should introspect incoming tokens, enforce token type requirements, then charge as needed.

## ❌ Incorrect

```typescript
// Accepts token blindly and returns paid response
const token = req.headers["skyfire-pay-id"];
return res.json({ data: "premium content", token });
```

## ✅ Correct

```typescript
const skyfireApiKey = process.env.SKYFIRE_SELLER_API_KEY;
const token = req.headers["skyfire-pay-id"];
if (!token || typeof token !== "string") {
  return res.status(403).json({ error: "Missing token in skyfire-pay-id header" });
}

const introspectResp = await fetch("https://api.skyfire.xyz/api/v1/tokens/introspect", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": skyfireApiKey
  },
  body: JSON.stringify({ token })
});
if (!introspectResp.ok) return res.status(401).json({ error: "Invalid token" });

const introspect = await introspectResp.json();
if (!introspect.isValid) {
  return res.status(401).json({ error: introspect.validationError || "Invalid token" });
}

const chargeResp = await fetch("https://api.skyfire.xyz/api/v1/tokens/charge", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": skyfireApiKey
  },
  body: JSON.stringify({ token, chargeAmount: "0.01" })
});
if (!chargeResp.ok) return res.status(402).json({ error: "Charge failed" });

return res.json({ ok: true });
```

## Key Points

- Read token from `skyfire-pay-id`.
- Introspect token before charging.
- Return `403` missing, `401` invalid, `402` insufficient payment.
- Charge only after validation.

## Reference

- [Introspect Token](https://docs.skyfire.xyz/reference/introspect-token)
- [Charge Token](https://docs.skyfire.xyz/reference/charge-token)
- [Handling Missing or Invalid Tokens](https://docs.skyfire.xyz/reference/handling-missing-or-invalid-tokens)
