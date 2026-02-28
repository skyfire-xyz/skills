---
title: Manage Seller Service Lifecycle
impact: HIGH
description: Prevents misconfigured services by covering list/get/create/update/activate/deactivate APIs and buyerIdentityRequirement fields.
tags: [seller, services, lifecycle, directory]
---

# Manage Seller Service Lifecycle

Seller services should be discoverable to the seller, correctly configured at creation time, and explicitly managed through activation states.

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

// 1) List seller services for the current seller agent
const all = await fetch("https://api.skyfire.xyz/api/v1/agents/seller-services", {
  method: "GET",
  headers
}).then((r) => r.json());

// 2) Create service with required fields
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
    // Empty arrays are valid if no additional identity fields are required
    buyerIdentityRequirement: { individual: ["birthdate"], business: [] },
    acceptedTokens: ["pay", "kya+pay"]
  })
});

const sellerServiceId = all.data?.[0]?.id;
if (!sellerServiceId) throw new Error("No seller service found");

// 3) Get one service by ID
const service = await fetch(
  `https://api.skyfire.xyz/api/v1/agents/seller-services/${sellerServiceId}`,
  { method: "GET", headers }
).then((r) => r.json());

// 4) Update selected fields
await fetch(`https://api.skyfire.xyz/api/v1/agents/seller-services/${service.id}`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({
    description: "Updated weather service with alerts",
    acceptedTokens: ["kya", "pay", "kya+pay"]
  })
});

// 5) Activate / deactivate as needed
await fetch(`https://api.skyfire.xyz/api/v1/agents/seller-services/${service.id}/activate`, {
  method: "POST",
  headers
});
```

## Key Points

- Use `GET /api/v1/agents/seller-services` to list all seller services owned by the current seller agent.
- Use `GET /api/v1/agents/seller-services/{sellerServiceId}` for detail checks before updates or activation.
- Use `POST /api/v1/agents/seller-services` to create.
- Use `PATCH /api/v1/agents/seller-services/{sellerServiceId}` to update.
- Use `POST .../{sellerServiceId}/activate` and `POST .../{sellerServiceId}/deactivate` for lifecycle state.
- Create requires `name`, `description`, `tags`, `type`, `price`, `priceModel`, `minimumTokenAmount`, and `buyerIdentityRequirement`.
- `type` controls URL fields: `openApiSpecUrl` (`API`), `mcpServerUrl` (MCP types), `websiteUrl` (`WEB_PAGE`), `fetchAgentProfileUrl` (`FETCH_AGENT`).
- Configure `acceptedTokens` and `maxTokenTTLSeconds` intentionally.
- `buyerIdentityRequirement` supports `individual` and `business` field arrays; both can be empty arrays when only verified email/no extra identity fields are needed.
- Activation can fail for unapproved services (`BAD_REQUEST`); plan around review/approval workflows.

## Reference

- [Get Agent's Services - All](https://docs.skyfire.xyz/reference/get-agents-seller-services-all)
- [Get Agent's Service](https://docs.skyfire.xyz/reference/get-agents-service)
- [Create Agent's Service](https://docs.skyfire.xyz/reference/create-agents-service-2)
- [buyerIdentityRequirement](https://docs.skyfire.xyz/reference/buyeridentityrequirement)
- [Update Agent's Service](https://docs.skyfire.xyz/reference/update-agents-service)
- [Activate Agent's Service](https://docs.skyfire.xyz/reference/activate-agents-service)
- [Deactivate Agent's Service](https://docs.skyfire.xyz/reference/deactivate-agents-service)
