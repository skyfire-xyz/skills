---
title: Manage Enterprise Users and Personal Data
impact: MEDIUM
description: Covers enterprise admin endpoints for user lifecycle and personal data operations.
tags: [enterprise, admin, users, compliance]
---

# Manage Enterprise Users and Personal Data

Enterprise workflows use organization user endpoints with enterprise admin API keys.

## ❌ Incorrect

```typescript
// Uses buyer/seller key for enterprise user admin operations
await fetch("https://api.skyfire.xyz/api/v1/organizations/users", {
  method: "POST",
  headers: { "skyfire-api-key": process.env.SKYFIRE_BUYER_API_KEY! }
});
```

## ✅ Correct

```typescript
const enterpriseKey = process.env.SKYFIRE_ENTERPRISE_ADMIN_API_KEY!;

await fetch("https://api.skyfire.xyz/api/v1/organizations/users", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": enterpriseKey
  },
  body: JSON.stringify({
    email: "new-user@example.com",
    role: "MEMBER"
  })
});
```

## Key Points

- Use Enterprise Admin User API key for enterprise user lifecycle operations.
- Use create/list endpoints for membership management.
- Use activate/deactivate endpoints for user status transitions.
- Use personal-data endpoint for regulated profile updates with explicit payload shapes.

## Reference

- [Create Enterprise User](https://docs.skyfire.xyz/reference/create-enterprise-user)
- [Get Enterprise Users](https://docs.skyfire.xyz/reference/get-enterprise-users)
- [Set Enterprise User Personal Data](https://docs.skyfire.xyz/reference/set-enterprise-user-personal-data)
- [Set Enterprise User Active](https://docs.skyfire.xyz/reference/set-enterprise-user-active)
- [Set Enterprise User Inactive](https://docs.skyfire.xyz/reference/set-enterprise-user-inactive)
