---
name: skyfire
description: Build buyer and seller agent workflows with Skyfire KYA, PAY, and KYA+PAY tokens. Use when implementing token creation, token introspection and charging, seller service lifecycle, service discovery, Skyfire MCP integration, or enterprise admin operations.
tags: [skyfire, kya, pay, kyapay, mcp, agent-payments, identity]
---

## When to use

Use this skill when:
- Building agent workflows that require identity and/or payment tokens
- Creating buyer tokens (`kya`, `pay`, `kya+pay`) via REST or Skyfire MCP
- Accepting tokens on seller APIs and charging payment-capable tokens
- Defining or updating seller service metadata and token requirements
- Discovering services and tags from Skyfire service directory APIs
- Managing enterprise users and agent settings via admin endpoints

## Quick Start

1. Use `https://api.skyfire.xyz` and send `skyfire-api-key` on authenticated endpoints.
2. Use `https://mcp.skyfire.xyz/mcp` with `skyfire-api-key` for MCP workflows.
3. Pick token type by operation:
   - `kya`: identity-only
   - `pay`: payment-only
   - `kya+pay`: identity + payment
4. Pass buyer token to seller service in `skyfire-pay-id` (recommended by Skyfire docs).
5. For seller charging and balance checks, use token introspection and charge endpoints.

## Workflow Routing

### 1. Platform and Authentication
- [Set Up API Keys and Environment](rules/setup-api-keys.md)

### 2. Buyer Token Creation Patterns
- [Choose the Right Token Type](rules/token-types.md)
- [Create Buyer Tokens Correctly](rules/buyer-create-token.md)
- [Enforce Token Creation Constraints](rules/token-creation-constraints.md)

### 3. Seller Token Acceptance and Charging
- [Use Introspection and Charge Correctly](rules/seller-introspect-charge.md)
- [Verify JWT Claims with JWKS](rules/jwt-verification-claims.md)
- [Handle Missing or Invalid Tokens Consistently](rules/token-error-handling.md)

### 4. Seller Service Management
- [Manage Seller Service Lifecycle](rules/seller-service-lifecycle.md)

### 5. Discovery and Agent Operations
- [Discover Services and Tags](rules/service-directory-discovery.md)
- [Use Wallet, Source IP, and Token Version APIs](rules/agent-ops-wallet-ip-version.md)

### 6. MCP Integration Patterns
- [Integrate Skyfire MCP in Agent Workflows](rules/mcp-integration.md)

### 7. Enterprise Operations
- [Manage Enterprise Users and Personal Data](rules/enterprise-admin-ops.md)

### 8. Security and Reliability Patterns
- [Apply Skyfire Security Best Practices](rules/security-best-practices.md)

## References

- [Skyfire Developer Portal](https://skyfire.xyz/llms.txt)
- [Developer Docs Overview](https://docs.skyfire.xyz/docs)
- [Welcome / Environments](https://docs.skyfire.xyz/reference/welcome)
- [API Authentication](https://docs.skyfire.xyz/reference/api-authentication)
- [Create Token](https://docs.skyfire.xyz/reference/create-token)
- [Introspect Token](https://docs.skyfire.xyz/reference/introspect-token)
- [Charge Token](https://docs.skyfire.xyz/reference/charge-token)
- [Verify and Extract Data from Tokens](https://docs.skyfire.xyz/reference/verify-and-extract-data-from-tokens)
- [Integrating Tokens into Seller Services](https://docs.skyfire.xyz/reference/integrating-tokens-into-your-seller-services)
