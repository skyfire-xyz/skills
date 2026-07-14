---
title: Use Wallet and Source IP APIs
impact: MEDIUM
description: Covers operational endpoints for wallet balance checks and source IP controls.
tags: [ops, wallet, source-ip, agent]
---

# Use Wallet and Source IP APIs

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

- Use `GET /api/v1/agents/balance` to check available funds before creating high-value payment tokens.
- Set the source IP list when you need stricter network-origin controls on agent requests.

## Reference

- [Get Agent's Wallet Balance](https://docs.skyfire.xyz/reference/get-agents-wallet-balance)
- [Get Agent's Source IP Addresses](https://docs.skyfire.xyz/reference/get-agents-source-ip-addresses)
- [Set Agent's Source IP Addresses](https://docs.skyfire.xyz/reference/set-agents-source-ip-addresses)
