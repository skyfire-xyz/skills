---
title: Manage Seller Service Lifecycle
impact: HIGH
description: Prevents misconfigured services by using the documented create, update, activate, and deactivate lifecycle APIs.
tags: [seller, services, lifecycle, directory]
---

# Manage Seller Service Lifecycle

Seller services should be created with complete metadata, then updated and activated explicitly.

## ❌ Incorrect

```typescript
// Incomplete payload and wrong endpoint assumptions
await fetch("https://api.skyfire.xyz/api/x/seller-services", {
  method: "POST",
  body: JSON.stringify({ name: "My service" })
});
```

## ✅ Correct

```typescript
const headers = {
  "content-type": "application/json",
  "skyfire-api-key": process.env.SKYFIRE_SELLER_API_KEY!
};

await fetch("https://api.skyfire.xyz/api/v1/agents/seller-services", {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "Weather Data API Service",
    description: "Provides real-time weather and forecasts",
    tags: ["weather", "api", "data"],
    type: "API",
    price: "0.02",
    priceModel: "PAY_PER_USE",
    minimumTokenAmount: "0.02",
    openApiSpecUrl: "https://api.weatherservice.com/v1/openapi.json",
    buyerIdentityRequirement: { individual: ["birthdate"], business: [] },
    acceptedTokens: ["pay", "kya+pay"]
  })
});
```

## Key Points

- Use `POST /api/v1/agents/seller-services` to create.
- Use `PATCH /api/v1/agents/seller-services/{sellerServiceId}` to update.
- Use activate/deactivate endpoints for lifecycle state.
- Set `acceptedTokens`, `buyerIdentityRequirement`, and pricing fields deliberately.
- For API services, include `openApiSpecUrl`.

## Reference

- [Create Agent's Service](https://docs.skyfire.xyz/reference/create-agents-service-2)
- [Update Agent's Service](https://docs.skyfire.xyz/reference/update-agents-service)
- [Activate Agent's Service](https://docs.skyfire.xyz/reference/activate-agents-service)
- [Deactivate Agent's Service](https://docs.skyfire.xyz/reference/deactivate-agents-service)
