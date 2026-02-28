---
title: Integrate Skyfire MCP in Agent Workflows
impact: HIGH
description: Guides reliable Skyfire MCP usage for seller discovery and token creation in agent workflows.
tags: [mcp, agents, buyer, integration]
---

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
