import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const GET: APIRoute = async ({ request }) => {
  if (!env?.GUESTBOOK) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const listOptions: any = { limit: 100 };
  if (slug) {
    listOptions.prefix = `comment:${slug}:`;
  }

  const list = await env.GUESTBOOK.list(listOptions);
  const entries: any[] = [];
  for (const key of list.keys) {
    const value = await env.GUESTBOOK.get(key.name);
    if (value) {
      entries.push(JSON.parse(value));
    }
  }
  entries.sort((a: any, b: any) => new Date(b.created_at || b.timestamp).getTime() - new Date(a.created_at || a.timestamp).getTime());

  return new Response(JSON.stringify(entries), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data.name || !data.message) {
      return new Response(JSON.stringify({ error: "Name and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (env?.GUESTBOOK) {
      const id = Date.now().toString();
      const now = new Date().toISOString();
      const slug = data.slug || "global";
      const key = `comment:${slug}:${id}`;
      await env.GUESTBOOK.put(
        key,
        JSON.stringify({ id, name: data.name, message: data.message, slug, created_at: now, timestamp: now })
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
