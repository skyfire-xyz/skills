---
title: Use Wallet, Source IP, and Token Version APIs
impact: MEDIUM
description: Covers operational endpoints for wallet checks, source IP controls, and token version management.
tags: [ops, wallet, source-ip, token-version, agent]
---

# Use Wallet, Source IP, and Token Version APIs

Operational APIs help keep agent behavior predictable and auditable.

## ❌ Incorrect

```bash
# Creating tokens without checking available funds
curl -X POST https://api.skyfire.xyz/api/v1/tokens ...
```

## ✅ Correct

```bash
# Check available balance first
curl -X GET "https://api.skyfire.xyz/api/v1/agents/balance" \
  -H "skyfire-api-key: $SKYFIRE_BUYER_API_KEY"

# Restrict expected source IP addresses for agent requests
curl -X PUT "https://api.skyfire.xyz/api/v1/agents/source-ips" \
  -H "skyfire-api-key: $SKYFIRE_BUYER_API_KEY" \
  -H "content-type: application/json" \
  -d '["1.1.1.1","2.2.2.2"]'
```

## Key Points

- Use wallet balance endpoint before creating high-value payment tokens.
- Set source IP list when you need stricter network-origin controls.
- Manage token version explicitly if your stack requires deterministic token claim versions.
- Treat `404 Token Version Not Set` as "latest supported version" behavior.

## Reference

- [Get Agent's Wallet Balance](https://docs.skyfire.xyz/reference/get-agents-wallet-balance)
- [Get Agent's Source IP Addresses](https://docs.skyfire.xyz/reference/get-agents-source-ip-addresses)
- [Set Agent's Source IP Addresses](https://docs.skyfire.xyz/reference/set-agents-source-ip-addresses)
- [Get Agent's Token Version](https://docs.skyfire.xyz/reference/get-agents-token-version)
- [Set Agent's Token Version](https://docs.skyfire.xyz/reference/set-agents-token-version)
