---
title: Manage Enterprise Users and Personal Data
impact: MEDIUM
description: Covers enterprise admin APIs for creating users, listing users, personal data updates, and activation lifecycle.
tags: [enterprise, admin, users, compliance]
---

# Manage Enterprise Users and Personal Data

Enterprise workflows use `/api/v1/organizations/users*` endpoints with an Enterprise Admin User API key.

## ❌ Incorrect

```typescript
// Uses buyer key and omits required role/email payload fields
await fetch("https://api.skyfire.xyz/api/v1/organizations/users", {
  method: "POST",
  headers: { "skyfire-api-key": process.env.SKYFIRE_BUYER_API_KEY! },
  body: JSON.stringify({ email: "new-user@example.com" })
});
```

## ✅ Correct

```typescript
const enterpriseKey = process.env.SKYFIRE_ENTERPRISE_ADMIN_API_KEY!;

// 1) Create enterprise member/admin user
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

// 2) List users (supports pageSize, pageCursor, filter)
await fetch(
  "https://api.skyfire.xyz/api/v1/organizations/users?pageSize=20&filter=%7B%22orgMemberRole%22%3A%22MEMBER%22%7D",
  {
    method: "GET",
    headers: { "skyfire-api-key": enterpriseKey }
  }
);

// 3) Update personal data for a specific user
await fetch("https://api.skyfire.xyz/api/v1/organizations/users/9414a52e-97ab-4d75-b139-39838e92e962/personal-data", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": enterpriseKey
  },
  body: JSON.stringify({
    data: {
      person: { firstName: "John", lastName: "Doe", birthdate: "1990-01-01" },
      emailAddresses: [{ type: "Work", address: "john.doe@example.com" }]
    }
  })
});

// 4) Activate/deactivate by userId
await fetch("https://api.skyfire.xyz/api/v1/organizations/users/9414a52e-97ab-4d75-b139-39838e92e962/activate", {
  method: "PATCH",
  headers: { "skyfire-api-key": enterpriseKey }
});
```

## Key Points

- Use Enterprise Admin User API keys only; buyer/seller agent keys are not valid here.
- `POST /api/v1/organizations/users` requires `email` and `role` (`MEMBER` or `ADMIN`).
- Create response may include `buyerAgent` details and may include `userApiKey` for admin users.
- `GET /api/v1/organizations/users` supports `pageSize`, `pageCursor`, and structured `filter`.
- Personal data updates require `POST /api/v1/organizations/users/{userId}/personal-data` with `data` object.
- Activate/deactivate use `PATCH .../{userId}/activate` and `PATCH .../{userId}/deactivate`.
- Expect `401` for invalid org API key, `404` for missing user, and `422` for invalid UUID/payload validation.

## Reference

- [Create Enterprise User or Enterprise Admin User](https://docs.skyfire.xyz/reference/create-enterprise-user)
- [Get Enterprise Users](https://docs.skyfire.xyz/reference/get-enterprise-users)
- [Set Enterprise User Personal Data](https://docs.skyfire.xyz/reference/set-enterprise-user-personal-data)
- [Set Enterprise User Status as Active](https://docs.skyfire.xyz/reference/set-enterprise-user-active)
- [Set Enterprise User Status as Inactive](https://docs.skyfire.xyz/reference/set-enterprise-user-inactive)
