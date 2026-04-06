/**
 * Remote MCP endpoint for ClaudeBoost Enterprise.
 *
 * Claude Code connects via .mcp.json → this endpoint handles the
 * MCP Streamable HTTP transport protocol (JSON-RPC over HTTP).
 *
 * Auth: Bearer cb_org_<key> header → SHA-256 hash lookup in org_api_keys.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { TOOL_DEFINITIONS, handleToolCall } from "@/lib/mcp/tools";
import crypto from "crypto";

// MCP protocol version
const MCP_VERSION = "2025-03-26";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

async function resolveOrg(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer cb_org_")) {
    return null;
  }
  const key = authHeader.replace("Bearer ", "");
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");

  const supabase = createAdminClient();
  const { data: apiKey } = await supabase
    .from("org_api_keys")
    .select("org_id")
    .eq("key_hash", keyHash)
    .single();

  if (!apiKey) return null;

  // Update last_used_at
  await supabase
    .from("org_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", keyHash);

  // Fetch org details
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, anthropic_api_key, boost_level")
    .eq("id", apiKey.org_id)
    .single();

  if (!org || !org.anthropic_api_key) return null;

  return {
    orgId: org.id as string,
    orgName: org.name as string,
    anthropicApiKey: org.anthropic_api_key as string,
    boostLevel: (org.boost_level as string) || "medium",
    supabase,
  };
}

function jsonRpcResponse(id: string | number | undefined, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: string | number | undefined, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

async function handleRequest(req: JsonRpcRequest, orgCtx: NonNullable<Awaited<ReturnType<typeof resolveOrg>>>) {
  const { method, params, id } = req;

  switch (method) {
    case "initialize":
      return jsonRpcResponse(id, {
        protocolVersion: MCP_VERSION,
        capabilities: { tools: {} },
        serverInfo: {
          name: "claudeboost",
          version: "2.0.0",
        },
      });

    case "notifications/initialized":
      // Client notification, no response needed
      return null;

    case "tools/list":
      return jsonRpcResponse(id, { tools: TOOL_DEFINITIONS });

    case "tools/call": {
      const toolName = (params as Record<string, unknown>)?.name as string;
      const toolArgs = ((params as Record<string, unknown>)?.arguments ?? {}) as Record<string, unknown>;

      try {
        const result = await handleToolCall(toolName, toolArgs, orgCtx);
        return jsonRpcResponse(id, result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return jsonRpcResponse(id, {
          content: [{ type: "text", text: JSON.stringify({ error: msg }) }],
          isError: true,
        });
      }
    }

    case "ping":
      return jsonRpcResponse(id, {});

    default:
      return jsonRpcError(id, -32601, `Method not found: ${method}`);
  }
}

export async function POST(request: NextRequest) {
  // Validate auth
  const authHeader = request.headers.get("authorization");
  const orgCtx = await resolveOrg(authHeader);

  if (!orgCtx) {
    return NextResponse.json(
      jsonRpcError(undefined, -32000, "Invalid or missing API key. Generate one at claudeboost.vercel.app"),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Handle single request
    if (!Array.isArray(body)) {
      const result = await handleRequest(body as JsonRpcRequest, orgCtx);
      if (result === null) {
        return new NextResponse(null, { status: 204 });
      }
      return NextResponse.json(result);
    }

    // Handle batch
    const results = await Promise.all(
      (body as JsonRpcRequest[]).map((req) => handleRequest(req, orgCtx))
    );
    const filtered = results.filter((r) => r !== null);
    return NextResponse.json(filtered);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      jsonRpcError(undefined, -32700, `Parse error: ${msg}`),
      { status: 400 }
    );
  }
}

// MCP spec requires GET to return server info
export async function GET() {
  return NextResponse.json({
    name: "claudeboost",
    version: "2.0.0",
    protocolVersion: MCP_VERSION,
  });
}
