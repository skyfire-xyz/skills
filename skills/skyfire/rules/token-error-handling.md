---
title: Handle Missing or Invalid Tokens Consistently
impact: HIGH
description: Improves interoperability with agents by using predictable status codes and token-type-specific error messages.
tags: [errors, status-codes, seller, reliability]
---

# Handle Missing or Invalid Tokens Consistently

Use consistent HTTP semantics so buyer agents can recover quickly.

## ❌ Incorrect

```typescript
// Everything returns 500, no actionable message
return res.status(500).send("Bad token");
```

## ✅ Correct

```typescript
if (!token) {
  return res.status(403).send("Missing Pay token in the skyfire-pay-id header.");
}

if (!isValidToken) {
  return res.status(401).send("Invalid Pay token in the skyfire-pay-id header.");
}

if (!hasSufficientBalance) {
  return res.status(402).send("The balance on the given 'pay' token is not enough.");
}
```

## Key Points

- Return `403` for missing token.
- Return `401` for invalid/expired token.
- Return `402` for insufficient balance.
- Include token type in message (`kya`, `pay`, `kya+pay`) to guide remediation.
- Prefer structured JSON errors for MCP/LLM clients.

## Reference

- [Handling Missing or Invalid Tokens](https://docs.skyfire.xyz/reference/handling-missing-or-invalid-tokens)
- [HTTP Error Status Codes](https://docs.skyfire.xyz/reference/http-error-status-codes)
