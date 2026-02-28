---
title: Discover Services with Full Directory APIs
impact: MEDIUM
description: Helps buyers select valid services by using the complete Skyfire directory API surface before token creation.
tags: [buyer, directory, discovery, services]
---

# Discover Services with Full Directory APIs

Use directory endpoints to discover and validate seller services before generating tokens.

## ❌ Incorrect

```typescript
// Hardcoded, unverified seller service ID
const sellerServiceId = "service-for-ai-news";
```

## ✅ Correct

```typescript
// 1) Get available tags
const tags = await fetch("https://api.skyfire.xyz/api/v1/directory/tags").then((r) => r.json());

// 2) Get all discoverable approved+active services
const allServices = await fetch("https://api.skyfire.xyz/api/v1/directory/services").then((r) => r.json());

// 3) Filter by tags when you know topical scope
const matchingServices = await fetch(
  "https://api.skyfire.xyz/api/v1/directory/services/search?commaDelimitedTags=ai,news"
).then((r) => r.json());

// 4) Optional: list services for a known seller agent
const sellerServices = await fetch(
  "https://api.skyfire.xyz/api/v1/directory/agents/98755a15-bcbb-4e7c-a4ac-0ae21b9ce5c7/services"
).then((r) => r.json());

// 5) Resolve final service ID and hydrate full details
const candidateId = matchingServices.data?.[0]?.id ?? allServices.data?.[0]?.id;
if (!candidateId) throw new Error("No discoverable service found");

const service = await fetch(
  `https://api.skyfire.xyz/api/v1/directory/services/${candidateId}`
).then((r) => r.json());

const sellerServiceId = service.id;
```

## Key Points

- Use `get-all-service-tags` to build search/filter UX and avoid ad-hoc tags.
- Use `get-all-services` as baseline discovery for approved and active services.
- Use `get-services-by-tags` for topical selection.
- Use `get-services-by-agent` when you already know seller agent ID.
- Use `get-service` for final detail validation before token creation.
- Persist only trusted service IDs from directory responses.

## Reference

- [Get All Service Tags](https://docs.skyfire.xyz/reference/get-all-service-tags)
- [Get All Services](https://docs.skyfire.xyz/reference/get-all-services)
- [Get Services by Tags](https://docs.skyfire.xyz/reference/get-services-by-tags)
- [Get Service](https://docs.skyfire.xyz/reference/get-service)
- [Get Services by Agent](https://docs.skyfire.xyz/reference/get-services-by-agent)
