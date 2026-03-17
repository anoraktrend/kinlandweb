/**
 * Cloudflare Worker for Kinland website
 * Serves static assets and handles routing for the Hugo-generated site
 */

// Static assets mapping
const ASSETS = {
  // Add mappings for your static assets
  "/": "/index.html",
  "/admin/": "/admin/index.html",
  "/favicon.ico": "/favicon.ico",
  "/robots.txt": "/robots.txt"
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle static assets
    if (path.startsWith("/assets/") || path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      return handleAsset(request, path, env);
    }

    // Handle admin interface
    if (path.startsWith("/admin/")) {
      return handleAdmin(request, path, env);
    }

    // Handle API routes
    if (path.startsWith("/api/")) {
      return handleAPI(request, path, env);
    }

    // Handle content routes
    if (path === "/" || path.startsWith("/post/") || path.startsWith("/categories/") || path.startsWith("/tags/")) {
      return handleContent(request, path, env);
    }

    // Default to index.html for SPA routing
    return handleAsset(request, "/index.html", env);
  }
};

/**
 * Handle static asset requests
 */
async function handleAsset(request, path, env) {
  // Try to serve from KV storage first
  if (env && env.ASSETS) {
    const asset = await env.ASSETS.get(path);
    if (asset) {
      const headers = new Headers();
      const ext = path.split(".").pop();

      // Set appropriate content type
      const contentType = getContentType(ext);
      if (contentType) {
        headers.set("Content-Type", contentType);
      }

      // Set cache headers
      headers.set("Cache-Control", "public, max-age=31536000");

      return new Response(asset, {headers});
    }
  }

  // Fallback to serving from the worker bundle
  return new Response("Asset not found", {status: 404});
}

/**
 * Handle admin interface (Decap CMS)
 */
async function handleAdmin(request, path, env) {
  // Serve the admin interface
  const adminPath = path === "/admin/" ? "/admin/index.html" : path;

  if (env && env.ASSETS) {
    const adminFile = await env.ASSETS.get(adminPath);
    if (adminFile) {
      const headers = new Headers();
      headers.set("Content-Type", "text/html");
      headers.set("Cache-Control", "no-cache");
      return new Response(adminFile, {headers});
    }
  }

  return new Response("Admin interface not found", {status: 404});
}

/**
 * Handle API routes
 */
async function handleAPI(request, path, env) {
  const url = new URL(request.url);

  // Guestbook API
  if (path === "/api/guestbook") {
    if (request.method === "POST") {
      return handleGuestbookPost(request, env);
    } else if (request.method === "GET") {
      return handleGuestbookGet(request, env);
    }
  }

  // Contact form API
  if (path === "/api/contact") {
    if (request.method === "POST") {
      return handleContactPost(request, env);
    }
  }

  return new Response("API endpoint not found", {status: 404});
}

/**
 * Handle guestbook POST
 */
async function handleGuestbookPost(request, env) {
  try {
    const data = await request.json();

    // Validate data
    if (!data.name || !data.message) {
      return new Response(JSON.stringify({error: "Name and message are required"}), {
        status: 400,
        headers: {"Content-Type": "application/json"}
      });
    }

    // Store in KV (if available)
    if (env && env.GUESTBOOK) {
      const id = Date.now().toString();
      await env.GUESTBOOK.put(id, JSON.stringify({
        id,
        name: data.name,
        message: data.message,
        timestamp: new Date().toISOString()
      }));
    }

    return new Response(JSON.stringify({success: true, id: Date.now()}), {
      status: 200,
      headers: {"Content-Type": "application/json"}
    });
  } catch (error) {
    return new Response(JSON.stringify({error: "Invalid request"}), {
      status: 400,
      headers: {"Content-Type": "application/json"}
    });
  }
}

/**
 * Handle guestbook GET
 */
async function handleGuestbookGet(request, env) {
  if (env && env.GUESTBOOK) {
    const keys = await env.GUESTBOOK.list();
    const entries = [];

    for (const key of keys.keys) {
      const value = await env.GUESTBOOK.get(key.name);
      if (value) {
        entries.push(JSON.parse(value));
      }
    }

    // Sort by timestamp
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify(entries), {
      status: 200,
      headers: {"Content-Type": "application/json"}
    });
  }

  return new Response(JSON.stringify([]), {
    status: 200,
    headers: {"Content-Type": "application/json"}
  });
}

/**
 * Handle contact form POST
 */
async function handleContactPost(request, env) {
  try {
    const data = await request.json();

    // Validate data
    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({error: "Name, email, and message are required"}), {
        status: 400,
        headers: {"Content-Type": "application/json"}
      });
    }

    // Store in KV (if available)
    if (env && env.CONTACT) {
      const id = Date.now().toString();
      await env.CONTACT.put(id, JSON.stringify({
        id,
        name: data.name,
        email: data.email,
        message: data.message,
        timestamp: new Date().toISOString()
      }));
    }

    return new Response(JSON.stringify({success: true}), {
      status: 200,
      headers: {"Content-Type": "application/json"}
    });
  } catch (error) {
    return new Response(JSON.stringify({error: "Invalid request"}), {
      status: 400,
      headers: {"Content-Type": "application/json"}
    });
  }
}

/**
 * Handle content requests
 */
async function handleContent(request, path, env) {
  // For now, serve the main index.html for all content routes
  // In a full implementation, you'd serve the appropriate HTML file
  // based on the Hugo build output
  return handleAsset(request, "/index.html", env);
}

/**
 * Get content type based on file extension
 */
function getContentType(ext) {
  const types = {
    "css": "text/css",
    "js": "application/javascript",
    "html": "text/html",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "woff": "font/woff",
    "woff2": "font/woff2",
    "ttf": "font/ttf",
    "eot": "application/vnd.ms-fontobject"
  };

  return types[ext.toLowerCase()] || null;
}
