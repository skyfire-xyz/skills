---
title: Discover Services and Tags
impact: MEDIUM
description: Helps buyers select valid services by using directory APIs before token creation.
tags: [buyer, directory, discovery, services]
---

# Discover Services and Tags

Use directory endpoints to discover valid seller services before generating tokens.

## ❌ Incorrect

```typescript
// Hardcoded, unverified seller service ID
const sellerServiceId = "service-for-ai-news";
```

## ✅ Correct

```typescript
const tags = await fetch("https://api.skyfire.xyz/api/v1/directory/tags").then((r) => r.json());

const matchingServices = await fetch(
  "https://api.skyfire.xyz/api/v1/directory/services/search?commaDelimitedTags=ai,news"
).then((r) => r.json());

const sellerServiceId = matchingServices.data[0].id;
```

## Key Points

- Use tags and directory search to avoid invalid service IDs.
- Prefer approved and active services from directory endpoints.
- Persist service IDs from trusted discovery responses.
- Use `get-service` for detail checks before token generation.

## Reference

- [Get All Service Tags](https://docs.skyfire.xyz/reference/get-all-service-tags)
- [Get All Services](https://docs.skyfire.xyz/reference/get-all-services)
- [Get Services by Tags](https://docs.skyfire.xyz/reference/get-services-by-tags)
- [Get Service](https://docs.skyfire.xyz/reference/get-service)
