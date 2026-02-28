---
title: Validate, Introspect, Charge, and Reconcile Seller Payments
impact: CRITICAL
description: Prevents unsafe token acceptance and billing errors by combining introspection, charge rules, processing windows, and reconciliation.
tags: [seller, introspect, charge, payments, settlement, reconciliation]
---

# Validate, Introspect, Charge, and Reconcile Seller Payments

Seller services should introspect incoming tokens, enforce token type/amount constraints, then charge and reconcile as needed.

## ❌ Incorrect

```typescript
// Accepts token blindly and returns paid response
const token = req.headers["skyfire-pay-id"];
return res.json({ data: "premium content", token });
```

```typescript
// Charges an arbitrary amount with no validity/balance checks
await fetch("https://api.skyfire.xyz/api/v1/tokens/charge", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": process.env.SKYFIRE_SELLER_API_KEY!
  },
  body: JSON.stringify({ token, chargeAmount: "9999" })
});
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

// Only charge payment-capable token types
if (tokenType === "kya") {
  return res.status(402).json({ error: "kya token cannot be charged" });
}

// If service priceModel is PAY_PER_USE, you may omit chargeAmount and Skyfire uses service price.
const chargePayload =
  process.env.PRICE_MODEL === "PAY_PER_USE"
    ? { token }
    : { token, chargeAmount: "0.01" };

const chargeResp = await fetch("https://api.skyfire.xyz/api/v1/tokens/charge", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": skyfireApiKey
  },
  body: JSON.stringify(chargePayload)
});
if (!chargeResp.ok) return res.status(402).json({ error: "Charge failed" });

const chargeResult = await chargeResp.json();
return res.json({
  ok: true,
  amountCharged: chargeResult.amountCharged,
  remainingBalance: chargeResult.remainingBalance
});
```

## Key Points

- Read token from `skyfire-pay-id`.
- Introspect token before charging.
- Only charge `pay` / `kya+pay`; reject identity-only `kya` for paid operations.
- `chargeAmount` is a string and must be `> 0` and within token value/remaining balance.
- For `PAY_PER_USE` seller services, `chargeAmount` can be omitted and Skyfire charges service `price`.
- Return `403` missing, `401` invalid, `402` insufficient payment.
- Sellers should still enforce `exp` and reject expired tokens, even though charging can be allowed up to 24h post-expiry.
- Settlement is asynchronous and can take up to 51 hours depending on token expiry/grace windows.
- Buyers can reconcile via `GET /api/v1/tokens/{tokenId}/charges` where `tokenId` is token `jti`.

## Reference

- [Introspect Token](https://docs.skyfire.xyz/reference/introspect-token)
- [Charge Token](https://docs.skyfire.xyz/reference/charge-token)
- [chargeAmount](https://docs.skyfire.xyz/reference/chargeamount)
- [Charge Processing](https://docs.skyfire.xyz/reference/charge-processing)
- [Settlement of Payments](https://docs.skyfire.xyz/reference/settlement-of-payments)
- [Get Token Charges](https://docs.skyfire.xyz/reference/get-token-charges)
- [Handling Missing or Invalid Tokens](https://docs.skyfire.xyz/reference/handling-missing-or-invalid-tokens)
