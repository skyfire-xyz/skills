---
name: skyfire
description: Build buyer and seller agent workflows with Skyfire KYA, PAY, and KYA+PAY tokens. Use when implementing token creation, token introspection and charging, seller service lifecycle, service discovery, Skyfire MCP integration, or enterprise admin operations.
tags: [skyfire, kya, pay, kyapay, mcp, agent-payments, identity]
---

# skyfire

Build buyer and seller agent workflows with Skyfire KYA, PAY, and KYA+PAY tokens. Use when implementing token creation, token introspection and charging, seller service lifecycle, service discovery, Skyfire MCP integration, or enterprise admin operations.

## When to use
Use this skill when:
- Building agent workflows that require identity and/or payment tokens
- Creating buyer tokens (`kya`, `pay`, `kya+pay`) via REST or Skyfire MCP
- Accepting tokens on seller APIs and charging payment-capable tokens
- Defining or updating seller service metadata and token requirements
- Discovering services and tags from Skyfire service directory APIs
- Managing enterprise users and agent settings via admin endpoints

## Table of Contents

1. [Platform and Authentication](#platform-and-authentication)
   1.1. [Set Up API Keys and Environment](#set-up-api-keys-and-environment)

2. [Buyer Token Creation Patterns](#buyer-token-creation-patterns)
   2.1. [Choose the Right Token Type](#choose-the-right-token-type)
   2.2. [Create Buyer Tokens Correctly](#create-buyer-tokens-correctly)
   2.3. [Enforce Token Creation Constraints](#enforce-token-creation-constraints)

3. [Seller Token Acceptance and Charging](#seller-token-acceptance-and-charging)
   3.1. [Use Introspection and Charge Correctly](#use-introspection-and-charge-correctly)
   3.2. [Verify JWT Claims with JWKS](#verify-jwt-claims-with-jwks)
   3.3. [Handle Missing or Invalid Tokens Consistently](#handle-missing-or-invalid-tokens-consistently)

4. [Seller Service Management](#seller-service-management)
   4.1. [Manage Seller Service Lifecycle](#manage-seller-service-lifecycle)

5. [Discovery and Agent Operations](#discovery-and-agent-operations)
   5.1. [Discover Services and Tags](#discover-services-and-tags)
   5.2. [Use Wallet, Source IP, and Token Version APIs](#use-wallet-source-ip-and-token-version-apis)

6. [MCP Integration Patterns](#mcp-integration-patterns)
   6.1. [Integrate Skyfire MCP in Agent Workflows](#integrate-skyfire-mcp-in-agent-workflows)

7. [Enterprise Operations](#enterprise-operations)
   7.1. [Manage Enterprise Users and Personal Data](#manage-enterprise-users-and-personal-data)

8. [Security and Reliability Patterns](#security-and-reliability-patterns)
   8.1. [Apply Skyfire Security Best Practices](#apply-skyfire-security-best-practices)

---

## 1. Platform and Authentication

<a name="platform-and-authentication"></a>

### 1.1. Set Up API Keys and Environment

<a name="set-up-api-keys-and-environment"></a>

**Impact:** CRITICAL

> Prevents auth failures and role-mixing by enforcing correct key and environment setup.

# Set Up API Keys and Environment

Always configure and use API keys per agent role. Buyer and seller operations should not share the same key.

## ❌ Incorrect

```bash
# Hardcoded key and no environment separation
export SKYFIRE_API_KEY="same-key-for-all-roles"
```

```typescript
// Missing skyfire-api-key header
await fetch("https://api.skyfire.xyz/api/v1/tokens", { method: "POST" });
```

## ✅ Correct

```bash
# Store keys per role and environment
export SKYFIRE_ENV="production" # or sandbox
export SKYFIRE_BUYER_API_KEY="..."
export SKYFIRE_SELLER_API_KEY="..."
```

```typescript
const env = process.env.SKYFIRE_ENV === "sandbox" ? "sandbox" : "production";
const baseUrl = env === "sandbox" ? "https://api-sandbox.skyfire.xyz" : "https://api.skyfire.xyz";
const apiKey = process.env.SKYFIRE_BUYER_API_KEY;
if (!apiKey) throw new Error("Missing buyer API key");

const resp = await fetch(`${baseUrl}/api/v1/tokens`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": apiKey
  },
  body: JSON.stringify({
    type: "kya",
    sellerServiceId: "223bc3eb-9bcb-4e9b-afd6-f26ee0bd3894"
  })
});
```

## Key Points

- Keep buyer and seller keys separate.
- Match production keys to production endpoints and sandbox keys to sandbox endpoints.
- Send `skyfire-api-key` on every authenticated Skyfire request.
- Never hardcode API keys or commit them.

## Reference

- [API Authentication](https://docs.skyfire.xyz/reference/api-authentication)
- [Welcome / Environments](https://docs.skyfire.xyz/reference/welcome)

---

## 2. Buyer Token Creation Patterns

<a name="buyer-token-creation-patterns"></a>

### 2.1. Choose the Right Token Type

<a name="choose-the-right-token-type"></a>

**Impact:** HIGH

> Prevents incorrect token usage by mapping use cases to kya, pay, and kya+pay token types.

# Choose the Right Token Type

Pick token type based on the seller service requirement and endpoint behavior.

## ❌ Incorrect

```typescript
// Seller endpoint requires identity claim checks but this omits identity
const body = {
  type: "pay",
  tokenAmount: "5.00",
  sellerServiceId: "svc_data_feed"
};
```

## ✅ Correct

```typescript
// Identity only (KYA): use for auth/account creation flows
const kyaTokenRequest = {
  type: "kya",
  sellerServiceId: "svc_restricted_content",
  identityPermissions: ["nameFirst", "nameLast", "phoneNumber"]
};

// Payment only (PAY): use for payment-only calls
const payTokenRequest = {
  type: "pay",
  tokenAmount: "5.00",
  sellerServiceId: "svc_data_feed"
};

// Identity + payment (KYA+PAY): use for paid + identity-gated calls
const kyaPayTokenRequest = {
  type: "kya+pay",
  tokenAmount: "5.00",
  sellerServiceId: "svc_premium_api",
  identityPermissions: ["selectedCountryCode", "birthdate"]
};
```

## Key Points

- Use `kya` when seller requires identity claims only.
- Use `pay` when seller requires only payment and no identity fields.
- Use `kya+pay` when seller requires both identity and payment claims.
- Check seller service `acceptedTokens` and identity requirements before choosing token type.

## Reference

- [Token Types Overview](https://docs.skyfire.xyz/docs/explore-products)
- [Create Token](https://docs.skyfire.xyz/reference/create-token)

---

### 2.2. Create Buyer Tokens Correctly

<a name="create-buyer-tokens-correctly"></a>

**Impact:** CRITICAL

> Ensures buyer agents create valid tokens with required fields and practical expiration windows.

# Create Buyer Tokens Correctly

Buyer agents should create tokens with explicit type, target seller, and valid TTL constraints.

## ❌ Incorrect

```python
# Missing seller target and tokenAmount for pay token
payload = {"type": "pay", "expiresAt": 0}
```

```typescript
// Wrong endpoint + missing JSON headers
await fetch("https://api.skyfire.xyz/tokens", { method: "POST" });
```

## ✅ Correct

```python
import os
import requests
import time

api_key = os.environ["SKYFIRE_BUYER_API_KEY"]
expires_at = int(time.time()) + (20 * 60)  # epoch seconds

payload = {
    "type": "kya+pay",
    "buyerTag": "agent-123",
    "tokenAmount": "3.50",
    "sellerServiceId": "svc_financial_data",
    "expiresAt": expires_at,
    "identityPermissions": ["nameFirst", "nameLast"]
}

response = requests.post(
    "https://api.skyfire.xyz/api/v1/tokens",
    headers={
        "skyfire-api-key": api_key,
        "content-type": "application/json"
    },
    json=payload,
    timeout=20
)
response.raise_for_status()
token = response.json()["token"]
```

## Key Points

- Use `POST /api/v1/tokens`.
- For `pay` and `kya+pay`, include `tokenAmount`.
- Provide one target selector: `sellerServiceId` or `sellerDomainOrUrl`.
- `expiresAt` is Unix epoch seconds and must be between 10 seconds and 24 hours in the future.
- Persist only what you need; treat token material as sensitive.

## Reference

- [Create Token API](https://docs.skyfire.xyz/reference/create-token)
- [expiresAt](https://docs.skyfire.xyz/reference/expiresat)
- [tokenAmount](https://docs.skyfire.xyz/reference/tokenamount)

---

### 2.3. Enforce Token Creation Constraints

<a name="enforce-token-creation-constraints"></a>

**Impact:** HIGH

> Prevents invalid token creation by enforcing TTL, amount, and target constraints from Skyfire docs.

# Enforce Token Creation Constraints

Token creation must respect type-specific field requirements and strict TTL boundaries.

## ❌ Incorrect

```json
{
  "type": "pay",
  "sellerServiceId": "svc_123",
  "expiresAt": 9999999999
}
```

## ✅ Correct

```json
{
  "type": "pay",
  "sellerServiceId": "350d433d-6ed4-4482-bcfc-14b7da807f9b",
  "tokenAmount": "0.02",
  "expiresAt": 1763769321
}
```

## Key Points

- `type` must be one of `kya`, `pay`, `kya+pay`.
- `tokenAmount` is required for `pay` and `kya+pay`.
- One target is required: `sellerServiceId` or `sellerDomainOrUrl`.
- `expiresAt` is epoch seconds and must be between 10 seconds and 24 hours in the future.
- `tokenAmount` must be greater than zero and satisfy seller minimum token amount constraints.

## Reference

- [Create Token](https://docs.skyfire.xyz/reference/create-token)
- [tokenAmount](https://docs.skyfire.xyz/reference/tokenamount)
- [expiresAt](https://docs.skyfire.xyz/reference/expiresat)

---

## 3. Seller Token Acceptance and Charging

<a name="seller-token-acceptance-and-charging"></a>

### 3.1. Use Introspection and Charge Correctly

<a name="use-introspection-and-charge-correctly"></a>

**Impact:** CRITICAL

> Prevents unsafe token acceptance by using introspection before charging and returning consistent status codes.

# Use Introspection and Charge Correctly

Seller services should introspect incoming tokens, enforce token type requirements, then charge as needed.

## ❌ Incorrect

```typescript
// Accepts token blindly and returns paid response
const token = req.headers["skyfire-pay-id"];
return res.json({ data: "premium content", token });
```

## ✅ Correct

```typescript
const skyfireApiKey = process.env.SKYFIRE_SELLER_API_KEY;
const token = req.headers["skyfire-pay-id"];
if (!token || typeof token !== "string") {
  return res.status(403).json({ error: "Missing token in skyfire-pay-id header" });
}

const introspectResp = await fetch("https://api.skyfire.xyz/api/v1/tokens/introspect", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": skyfireApiKey
  },
  body: JSON.stringify({ token })
});
if (!introspectResp.ok) return res.status(401).json({ error: "Invalid token" });

const introspect = await introspectResp.json();
if (!introspect.isValid) {
  return res.status(401).json({ error: introspect.validationError || "Invalid token" });
}

const chargeResp = await fetch("https://api.skyfire.xyz/api/v1/tokens/charge", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "skyfire-api-key": skyfireApiKey
  },
  body: JSON.stringify({ token, chargeAmount: "0.01" })
});
if (!chargeResp.ok) return res.status(402).json({ error: "Charge failed" });

return res.json({ ok: true });
```

## Key Points

- Read token from `skyfire-pay-id`.
- Introspect token before charging.
- Return `403` missing, `401` invalid, `402` insufficient payment.
- Charge only after validation.

## Reference

- [Introspect Token](https://docs.skyfire.xyz/reference/introspect-token)
- [Charge Token](https://docs.skyfire.xyz/reference/charge-token)
- [Handling Missing or Invalid Tokens](https://docs.skyfire.xyz/reference/handling-missing-or-invalid-tokens)

---

### 3.2. Verify JWT Claims with JWKS

<a name="verify-jwt-claims-with-jwks"></a>

**Impact:** CRITICAL

> Prevents accepting forged or mis-targeted tokens by enforcing signature and claim validation.

# Verify JWT Claims with JWKS

Skyfire tokens are signed JWTs. Sellers should verify signature and required claims before granting access.

## ❌ Incorrect

```typescript
// Decodes token but never verifies signature/issuer/audience
const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"));
if (payload.exp > Date.now() / 1000) allowRequest();
```

## ✅ Correct

```typescript
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL("https://app.skyfire.xyz/.well-known/jwks.json"));
const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
  issuer: "https://app.skyfire.xyz",
  audience: "<YOUR_SELLER_AGENT_ID>",
  algorithms: ["ES256"]
});

// Enforce additional Skyfire claim checks based on token type and service targeting.
if (!payload.exp || !payload.iat || !payload.sub || !payload.jti) {
  throw new Error("Missing required claims");
}
if (!["kya+JWT", "pay+JWT", "kya+pay+JWT"].includes(String(protectedHeader.typ))) {
  throw new Error("Unsupported token type");
}
```

## Key Points

- Verify signature with Skyfire JWKS.
- Enforce `iss`, `aud`, `alg`, `exp`, `iat`, `sub`, and `jti`.
- Enforce expected token type (`kya+JWT`, `pay+JWT`, `kya+pay+JWT`).
- Validate service targeting claims before fulfilling requests.
- Cache JWKS for up to 60 minutes.

## Reference

- [Verify and Extract Data from Tokens](https://docs.skyfire.xyz/reference/verify-and-extract-data-from-tokens)
- [JWKS Endpoint](https://app.skyfire.xyz/.well-known/jwks.json)
- [Welcome / Environments](https://docs.skyfire.xyz/reference/welcome)

---

### 3.3. Handle Missing or Invalid Tokens Consistently

<a name="handle-missing-or-invalid-tokens-consistently"></a>

**Impact:** HIGH

> Improves interoperability with agents by using predictable status codes and token-type-specific error messages.

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

---

## 4. Seller Service Management

<a name="seller-service-management"></a>

### 4.1. Manage Seller Service Lifecycle

<a name="manage-seller-service-lifecycle"></a>

**Impact:** HIGH

> Prevents misconfigured services by using the documented create, update, activate, and deactivate lifecycle APIs.

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

---

## 5. Discovery and Agent Operations

<a name="discovery-and-agent-operations"></a>

### 5.1. Discover Services and Tags

<a name="discover-services-and-tags"></a>

**Impact:** MEDIUM

> Helps buyers select valid services by using directory APIs before token creation.

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

---

### 5.2. Use Wallet, Source IP, and Token Version APIs

<a name="use-wallet-source-ip-and-token-version-apis"></a>

**Impact:** MEDIUM

> Covers operational endpoints for wallet checks, source IP controls, and token version management.

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

---

## 6. MCP Integration Patterns

<a name="mcp-integration-patterns"></a>

### 6.1. Integrate Skyfire MCP in Agent Workflows

<a name="integrate-skyfire-mcp-in-agent-workflows"></a>

**Impact:** HIGH

> Guides reliable Skyfire MCP usage for seller discovery and token creation in agent workflows.

# Integrate Skyfire MCP in Agent Workflows

When using Skyfire MCP, initialize with `skyfire-api-key`, then call discovery/token tools before calling downstream paid tools.

## ❌ Incorrect

```python
# Calls downstream paid tool without creating Skyfire token first
result = await dappier_client.call_tool("real-time-search", {"query": "latest AI news"})
```

## ✅ Correct

```python
import os
from agents import Agent, Runner
from agents.mcp import MCPServerStreamableHttp

skyfire_server = MCPServerStreamableHttp(
    name="skyfire",
    params={
        "url": "https://mcp.skyfire.xyz/mcp",
        "headers": {"skyfire-api-key": os.getenv("SKYFIRE_API_KEY")},
    },
)

dappier_server = MCPServerStreamableHttp(
    name="dappier",
    params={"url": f"https://mcp.dappier.com/mcp?apiKey={os.getenv('DAPPIER_API_KEY')}"},
)

agent = Agent(
    name="Skyfire buyer flow",
    mcp_servers=[skyfire_server, dappier_server],
)

prompt = """
1) Use Skyfire MCP tool "find-sellers" to locate the seller service.
2) Use one of:
   - "create-kya-token"
   - "create-pay-token"
   - "create-kya-payment-token"
3) Call the downstream paid tool and pass the token exactly as that tool's schema requires.
"""

result = await Runner.run(agent, prompt)
print(result.final_output)
```

## Key Points

- Use `https://mcp.skyfire.xyz/mcp` (or sandbox MCP URL) with `skyfire-api-key`.
- Keep token handoff explicit between Skyfire MCP output and downstream tool input.
- For raw JSON-RPC flows, call `initialize` first and reuse `mcp-session-id`.
- Tool names documented by Skyfire include `find-sellers`, `create-kya-token`, `create-pay-token`, and `create-kya-payment-token`.

## Reference

- [Skyfire MCP](https://mcp.skyfire.xyz/mcp)
- [Using the Skyfire MCP Server](https://docs.skyfire.xyz/reference/using-the-skyfire-mcp-server)
- [MCP Servers Guidance](https://docs.skyfire.xyz/reference/mcp-servers)

---

## 7. Enterprise Operations

<a name="enterprise-operations"></a>

### 7.1. Manage Enterprise Users and Personal Data

<a name="manage-enterprise-users-and-personal-data"></a>

**Impact:** MEDIUM

> Covers enterprise admin endpoints for user lifecycle and personal data operations.

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

---

## 8. Security and Reliability Patterns

<a name="security-and-reliability-patterns"></a>

### 8.1. Apply Skyfire Security Best Practices

<a name="apply-skyfire-security-best-practices"></a>

**Impact:** CRITICAL

> Reduces fraud and leakage risks with strict JWT validation, least-privilege claims, and safe token handling.

# Apply Skyfire Security Best Practices

Treat all token operations as security-sensitive and payment-sensitive.

## ❌ Incorrect

```typescript
// Long-lived token + overbroad identity permission request
const payload = {
  type: "kya+pay",
  tokenAmount: "20.00",
  identityPermissions: ["*"],
  expiresAt: 9999999999
};
```

## ✅ Correct

```typescript
const now = Math.floor(Date.now() / 1000);
const expiresAt = now + 10 * 60; // 10 minutes

const payload = {
  type: "kya+pay",
  buyerTag: "order-123",
  sellerServiceId: "350d433d-6ed4-4482-bcfc-14b7da807f9b",
  tokenAmount: "2.00",
  identityPermissions: ["nameFirst", "nameLast"], // least privilege
  expiresAt
};
```

```python
def require_token_from_header(request):
    token = request.headers.get("skyfire-pay-id")
    if not token:
        raise PermissionError("Missing payment token")
    return token
```

## Key Points

- Verify JWT signature with Skyfire JWKS and enforce expected `iss`, `aud`, `alg`, `typ`, `exp`, and `iat`.
- Cache JWKS for up to 60 minutes as recommended.
- Use short expiration windows (10s to 24h for token creation).
- Request only minimum identity fields required by business logic.
- Validate token on every protected request and ensure service targeting claims match your service.
- Do not log raw tokens in plaintext logs.
- Fail closed on verification/charge API errors.

## Reference

- [HTTP Error Status Codes](https://docs.skyfire.xyz/reference/http-error-status-codes)
- [Verify and Extract Data from Tokens](https://docs.skyfire.xyz/reference/verify-and-extract-data-from-tokens)
- [JWKS Endpoint](https://app.skyfire.xyz/.well-known/jwks.json)

---

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

_This file is auto-generated. Run `npm run build:agents` after modifying skill rules._
