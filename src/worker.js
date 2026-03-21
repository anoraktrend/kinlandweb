import manifestJSON from '__STATIC_CONTENT_MANIFEST';

// Parse manifest once
let assetManifest = null;
try {
  assetManifest = typeof manifestJSON === 'string' ? JSON.parse(manifestJSON) : manifestJSON;
} catch (e) {
  console.error("Failed to parse manifest:", e);
  assetManifest = {};
}

/**
 * Cloudflare Worker for Kinland website
 * Serves static assets and handles routing for the Hugo-generated site
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // DEBUG: Log environment keys and manifest status
    console.log("Request path:", path);
    console.log("Env keys:", Object.keys(env));
    console.log("Manifest type:", typeof manifestJSON);
    console.log("Manifest parsed:", assetManifest ? Object.keys(assetManifest).length : "null");

    // Handle API routes first
    if (path.startsWith("/api/")) {
      return handleAPI(request, path, env);
    }

    // Handle admin interface (Decap CMS)
    if (path.startsWith("/admin/")) {
      return handleAdmin(request, path, env);
    }

    // Handle all other requests (static assets and Hugo content)
    return handleStaticRequest(request, path, env);
  }
};

/**
 * Handle static asset and content requests
 */
async function handleStaticRequest(request, path, env) {
  // 1. Try the exact path (e.g. /css/main.css, /img/logo.png, /post/my-post/index.html)
  let response = await serveAsset(path, env);
  if (response) return response;

  // 2. Try path + index.html (for clean URLs like /post/my-post/ -> /post/my-post/index.html)
  const indexPath = path.endsWith("/") ? path + "index.html" : path + "/index.html";
  response = await serveAsset(indexPath, env);
  if (response) return response;

  // 3. Try path + .html (for clean URLs like /about -> /about.html)
  if (!path.includes(".") && !path.endsWith("/")) {
    response = await serveAsset(path + ".html", env);
    if (response) return response;
  }

  // 4. Fallback to 404.html
  response = await serveAsset("/404.html", env);
  if (response) {
    return new Response(response.body, {
      status: 404,
      headers: response.headers
    });
  }

  // 5. Ultimate fallback
  return new Response("Not Found", { status: 404 });
}

/**
 * Serve an asset from available KV bindings
 */
async function serveAsset(path, env) {
  // Normalize path: remove leading slash for KV lookups
  let normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  
  // KV keys cannot be empty; if root is requested, this function returns null
  // and the caller handles the fallback to index.html
  if (!normalizedPath) return null;

  // Map requested path to hashed key using the manifest
  let storageKey = assetManifest[normalizedPath] || normalizedPath;

  // Primary: Use __STATIC_CONTENT (standard Wrangler [site] binding)
  if (env.__STATIC_CONTENT) {
    const asset = await env.__STATIC_CONTENT.get(storageKey, { type: "arrayBuffer" });
    if (asset) {
      return createAssetResponse(path, asset);
    }
  }

  // Secondary: Use ASSETS KV (manual binding)
  if (env.ASSETS) {
    const asset = await env.ASSETS.get(path, { type: "arrayBuffer" });
    if (asset) {
      return createAssetResponse(path, asset);
    }
  }

  return null;
}

/**
 * Create a Response object for an asset with proper headers
 */
function createAssetResponse(path, content) {
  const ext = path.split(".").pop().toLowerCase();
  const headers = new Headers();
  
  const contentType = getContentType(ext);
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  // Set Cache-Control headers
  // s-maxage=31536000 tells Cloudflare to cache this at the edge for a year
  if (path.startsWith("/assets/") || path.startsWith("/img/") || 
      path.match(/\.[a-f0-9]{5,}\./)) { // Matches common hash patterns
    headers.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
  } else {
    // HTML and other files get shorter caching
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
  }

  // Security headers (from _headers file)
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return new Response(content, { headers });
}

/**
 * Handle admin interface (Decap CMS)
 */
async function handleAdmin(request, path, env) {
  const adminPath = path === "/admin/" ? "/admin/index.html" : path;
  const response = await serveAsset(adminPath, env);
  
  if (response) {
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-cache");
    return new Response(response.body, { headers });
  }

  return new Response("Admin interface not found", {status: 404});
}

/**
 * Handle API routes
 */
async function handleAPI(request, path, env) {
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

  return new Response(JSON.stringify({error: "API endpoint not found"}), {
    status: 404,
    headers: {"Content-Type": "application/json"}
  });
}

/**
 * Handle guestbook POST
 */
async function handleGuestbookPost(request, env) {
  try {
    const data = await request.json();

    if (!data.name || !data.message) {
      return new Response(JSON.stringify({error: "Name and message are required"}), {
        status: 400,
        headers: {"Content-Type": "application/json"}
      });
    }

    if (env.GUESTBOOK) {
      const id = Date.now().toString();
      const now = new Date().toISOString();
      const slug = data.slug || "global";
      const key = `comment:${slug}:${id}`;
      
      await env.GUESTBOOK.put(key, JSON.stringify({
        id,
        name: data.name,
        message: data.message,
        slug,
        created_at: now, // Match Hugo template expectation
        timestamp: now   // Keep for compatibility
      }));
    }

    return new Response(JSON.stringify({success: true}), {
      status: 201,
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
  if (env.GUESTBOOK) {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");
    
    let listOptions = {limit: 100};
    if (slug) {
      listOptions.prefix = `comment:${slug}:`;
    }

    const list = await env.GUESTBOOK.list(listOptions);
    const entries = [];

    for (const key of list.keys) {
      const value = await env.GUESTBOOK.get(key.name);
      if (value) {
        entries.push(JSON.parse(value));
      }
    }

    // Sort by date descending
    entries.sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp));

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

    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({error: "Name, email, and message are required"}), {
        status: 400,
        headers: {"Content-Type": "application/json"}
      });
    }

    if (env.CONTACT) {
      const id = Date.now().toString();
      await env.CONTACT.put(id, JSON.stringify({
        id,
        ...data,
        timestamp: new Date().toISOString()
      }));
    }

    // Send email via Mailgun if enabled
    if (env.ENABLE_EMAILS === "true") {
      ctx.waitUntil(sendContactEmail(data, env));
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
 * Send contact form email via Mailgun
 */
async function sendContactEmail(data, env) {
  try {
    // Load template
    const templateResponse = await serveAsset("/emails/contact/index.html", env);
    if (!templateResponse) {
      console.error("Contact email template not found");
      return;
    }

    let html = await templateResponse.text();

    // Simple template replacement
    html = html.replace(/{{name}}/g, data.name)
               .replace(/{{email}}/g, data.email)
               .replace(/{{message}}/g, data.message);

    await sendMailgunEmail({
      to: env.CONTACT_EMAIL,
      from: `Kinland Contact Form <noreply@${env.MAILGUN_DOMAIN}>`,
      subject: `New Contact Form Submission from ${data.name}`,
      html: html
    }, env);
  } catch (error) {
    console.error("Failed to send contact email:", error);
  }
}

/**
 * Send email via Mailgun REST API
 */
async function sendMailgunEmail({to, from, subject, text, html}, env) {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_API_BASE_URL } = env;

  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    throw new Error("Mailgun configuration missing");
  }

  const formData = new FormData();
  formData.append("from", from);
  formData.append("to", to);
  formData.append("subject", subject);
  if (text) formData.append("text", text);
  if (html) formData.append("html", html);

  const auth = btoa(`api:${MAILGUN_API_KEY}`);
  
  const response = await fetch(`${MAILGUN_API_BASE_URL}/${MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mailgun API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}

/**
 * Get content type based on file extension
 */
function getContentType(ext) {
  const types = {
    "css": "text/css",
    "js": "application/javascript",
    "html": "text/html",
    "xml": "application/xml",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "webp": "image/webp",
    "avif": "image/avif",
    "ico": "image/x-icon",
    "woff": "font/woff",
    "woff2": "font/woff2",
    "ttf": "font/ttf",
    "eot": "application/vnd.ms-fontobject",
    "txt": "text/plain",
    "flac": "audio/flac"
  };

  return types[ext.toLowerCase()] || null;
}
