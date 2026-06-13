import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// PROTOCOL 3 (Part A): Technical Sanitization utility to sanitize inbound payloads against cross-site scripting (XSS)
function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") {
    return "";
  }
  
  let cleaned = input.trim();
  
  // Enforce Max payload length constraint
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  // Clean off standard executable wrappers, script blocks, custom Javascript protocols and event handlers
  cleaned = cleaned
    .replace(/<[^>]*>/g, "") // sweeps away markup nodes
    .replace(/javascript:/gi, "") // blocks inline URI event delegation
    .replace(/\s(onload|onerror|onclick|onmouseover|onfocus|onchange|onsubmit)\s*=/gi, " sanitizedAttribute=") // neutralizes event attributes
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // excludes risky low-level control chars

  return cleaned;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enforce strict Max payload limit restriction on JSON structures
  app.use(express.json({ limit: "15kb" }));

  // PROTOCOL 1: Secure HTTP Header Declarations (Compatible with sandbox container frames)
  app.use((req, res, next) => {
    // Avoid MIME sniff vulnerabilities
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Secure anti-XSS browser parsing mechanics
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Protect referrer leakage during navigation
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Shield API payload harvesting
    if (req.url.startsWith("/api/")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    }
    next();
  });

  // PROTOCOL 2: Memory-Efficient Request Limit Controller (Blocks scrapers and bots)
  const clientCallRegistry = new Map<string, { count: number; windowStart: number }>();
  const SHIELD_DURATION_MS = 15 * 60 * 1000; // 15 Minute window
  const THRESHOLD_CLIENT_TOTAL = 180; // High limit for standard UI browsing

  app.use((req, res, next) => {
    if (req.url.startsWith("/api/")) {
      // Safely fetch real proxy IP or local socket descriptors
      const reqIp = (req.headers["x-forwarded-for"] as string || "").split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
      const currentTime = Date.now();
      
      const record = clientCallRegistry.get(reqIp);
      if (!record) {
        clientCallRegistry.set(reqIp, { count: 1, windowStart: currentTime });
      } else {
        if (currentTime - record.windowStart > SHIELD_DURATION_MS) {
          // Sliding window reset
          clientCallRegistry.set(reqIp, { count: 1, windowStart: currentTime });
        } else {
          record.count++;
          // Stricter anti-flooding logic for POST forms
          if (req.method === "POST" && record.count > 30) {
            return res.status(429).json({ 
              error: "Submission speed threshold detected. Please pause a moment before completing your action." 
            });
          }
          if (record.count > THRESHOLD_CLIENT_TOTAL) {
            return res.status(429).json({ 
              error: "Activity limit reached. Content protected." 
            });
          }
        }
      }
    }
    next();
  });

  // API endpoint: Fetch all current local leads
  app.get("/api/leads", (req, res) => {
    try {
      const fileCwd = process.cwd();
      const filePath = path.join(fileCwd, "leads.json");
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return res.json(JSON.parse(fileContent));
      }
      return res.json([]);
    } catch (err) {
      console.error("Error reading leads file database:", err);
      return res.status(500).json({ error: "Could not retrieve local leads database" });
    }
  });

  // API endpoint: Capture a new lead and forward to Airtable if configured
  app.post("/api/leads", async (req, res) => {
    // PROTOCOL 3 (Part B): Extract raw parameters and sanitize lengths and scripts
    const { 
      name, 
      email, 
      phone, 
      company, 
      industry,
      source, 
      challenge, 
      question, 
      role, 
      sector, 
      notes, 
      findSource,
      timestamp 
    } = req.body;

    // Apply sanitization with precise length safety buffers for each parameters
    const nameSanitized = sanitizeString(name, 100);
    const emailSanitized = sanitizeString(email, 120);
    const phoneSanitized = sanitizeString(phone, 30);
    const companySanitized = sanitizeString(company, 120);
    const industrySanitized = sanitizeString(industry, 100);
    const sourceSanitized = sanitizeString(source, 150);
    const challengeSanitized = sanitizeString(challenge, 500);
    const questionSanitized = sanitizeString(question, 500);
    const roleSanitized = sanitizeString(role, 100);
    const sectorSanitized = sanitizeString(sector, 100);
    const notesSanitized = sanitizeString(notes, 800);
    const findSourceSanitized = sanitizeString(findSource, 150);
    const timestampSanitized = sanitizeString(timestamp, 50);

    // Enforce schema validation check
    if (!nameSanitized && !emailSanitized && !phoneSanitized) {
      return res.status(400).json({ error: "At least name, email, or phone is required." });
    }

    // Dynamic formatting check for email strings to guard database schemas and scrapers
    if (emailSanitized && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSanitized)) {
      return res.status(400).json({ error: "Invalid contact email schema structure." });
    }

    const newLead = {
      id: "lead_" + Math.random().toString(36).substring(2, 11),
      name: nameSanitized || "Anonymous Lead",
      email: emailSanitized || "",
      phone: phoneSanitized || "",
      company: companySanitized || "",
      industry: industrySanitized || "",
      source: sourceSanitized || "90-Day Strategy Charter Workbook",
      challenge: challengeSanitized || "",
      question: questionSanitized || "",
      role: roleSanitized || "",
      sector: sectorSanitized || "",
      notes: notesSanitized || "",
      findSource: findSourceSanitized || "",
      timestamp: timestampSanitized || new Date().toISOString()
    };

    let savedLocally = false;
    let savedToAirtable = false;
    let airtableError = null;

    // 1. Persist the lead locally on the server filesystem in workspace root
    try {
      const fileCwd = process.cwd();
      const filePath = path.join(fileCwd, "leads.json");
      let allLeads = [];
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          allLeads = JSON.parse(content);
          if (!Array.isArray(allLeads)) {
            allLeads = [];
          }
        } catch {
          allLeads = [];
        }
      }
      allLeads.push(newLead);
      fs.writeFileSync(filePath, JSON.stringify(allLeads, null, 2), "utf-8");
      savedLocally = true;
    } catch (err) {
      console.error("Error writing lead to local project database:", err);
    }

    // 2. Synchronize to external Airtable Base in real-time
    const pat = process.env.AIRTABLE_PAT;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE || "Leads";

    const isWhatsApp = newLead.source.toLowerCase().includes("whatsapp");
    const isNewsletter = newLead.source.toLowerCase().includes("newsletter") || 
                        newLead.company.toLowerCase().includes("newsletter");

    if (pat && baseId) {
      if (isWhatsApp || isNewsletter) {
        console.log(`Lead from source "${newLead.source}" is excluded from Airtable synchronization per configuration guidelines.`);
      } else {
        try {
          const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`;
        
        // Build a robust details description fallback combining all dynamic elements
        const detailsSummaryParts = [
          challenge ? `Primary Challenge: ${challenge}` : null,
          question ? `Customer Question: ${question}` : null,
          role ? `User Role: ${role}` : null,
          sector ? `Sector/Industry: ${sector || industry}` : null,
          notes ? `Additional Notes: ${notes}` : null,
          findSource ? `How they found us: ${findSource}` : null
        ].filter(Boolean);
        const detailsSummaryText = detailsSummaryParts.join(" | ");

        // Build the records payload mapping standard fields precisely
        const airtableFields: Record<string, any> = {
          "Name": newLead.name,
          "Email": newLead.email,
          "Phone": newLead.phone,
          "Company": newLead.company,
          "Source": newLead.source,
          "Timestamp": newLead.timestamp
        };

        // Add additional metadata if columns are present in Airtable schema or for complete coverage
        if (newLead.challenge) airtableFields["Challenge"] = newLead.challenge;
        if (newLead.question || newLead.notes) airtableFields["Notes"] = newLead.question || newLead.notes;
        if (newLead.role) airtableFields["Role"] = newLead.role;
        if (newLead.sector || newLead.industry) airtableFields["Sector"] = newLead.sector || newLead.industry;
        if (newLead.findSource) airtableFields["FindSource"] = newLead.findSource;
        if (detailsSummaryText) airtableFields["Details"] = detailsSummaryText;

        let currentFields = { ...airtableFields };
        let responseOk = false;
        const maxRetries = 10;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const response = await fetch(airtableUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${pat}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              records: [
                {
                  fields: currentFields
                }
              ]
            })
          });

          if (response.ok) {
            responseOk = true;
            savedToAirtable = true;
            break;
          }

          const errorData = await response.json().catch(() => ({}));
          console.error(`Airtable API response error details (Attempt ${attempt + 1}):`, errorData);

          let errorMessage = "";
          let errorType = "";

          if (errorData) {
            if (errorData.error) {
              if (typeof errorData.error === "object" && errorData.error !== null) {
                errorMessage = errorData.error.message || "";
                errorType = errorData.error.type || "";
              } else if (typeof errorData.error === "string") {
                errorMessage = errorData.error;
                errorType = errorData.error;
              }
            } else if (Array.isArray(errorData.errors)) {
              const firstErr = errorData.errors[0];
              if (firstErr) {
                errorMessage = firstErr.message || JSON.stringify(firstErr);
                errorType = firstErr.type || "UNKNOWN";
              }
            } else {
              errorMessage = JSON.stringify(errorData);
            }
          }

          // Append helpful instructions depending on HTTP status codes
          if (!errorMessage || errorMessage === "{}") {
            if (response.status === 401) {
              errorMessage = "Authentication failed (Unauthorized). Your AIRTABLE_PAT may be invalid or incorrectly copied.";
            } else if (response.status === 451) {
              errorMessage = "The requested resource is unavailable (HTTP 451).";
            } else if (response.status === 403) {
              errorMessage = "Permission denied (Forbidden). Your Personal Access Token (PAT) MUST have the 'data.records:write' scope explicitly granted, and access must be configured for the correct base.";
            } else if (response.status === 404) {
              errorMessage = `Resource not found (HTTP 404). Check that your AIRTABLE_BASE_ID ("${baseId}") is correct, and that your table "${tableId}" exists inside that base.`;
            } else {
              errorMessage = `Airtable server returned HTTP ${response.status}: ${response.statusText}`;
            }
          } else {
            // Include context-aware suggestions for common Airtable errors
            if (response.status === 403 || errorType.includes("INVALID_PERMISSIONS") || errorMessage.toLowerCase().includes("permission")) {
              errorMessage += " (Action Required: Ensure that your Airtable PAT includes the 'data.records:write' scope and that your workspace/base has shared authorization with this token.)";
            } else if (response.status === 404 || errorType.includes("NOT_FOUND") || errorMessage.toLowerCase().includes("not found")) {
              errorMessage += ` (Action Required: Ensure Airtable Base ID "${baseId}" is correct and Table "${tableId}" exists.)`;
            }
          }

          // Check if error is due to an unknown/missing field
          const isUnknownField = errorType === "UNKNOWN_FIELD_NAME" || 
                                 errorMessage.includes("Unknown field name") || 
                                 errorMessage.includes("does not exist") || 
                                 errorMessage.includes("invalid field");

          if (isUnknownField) {
            // Attempt to extract the unknown field's name from string quotes.
            const match = errorMessage.match(/["']([^"']+)["']/);
            let removedAny = false;

            if (match && match[1] && currentFields[match[1]] !== undefined) {
              console.log(`Self-healing protocol: Removing unknown field "${match[1]}" from Airtable submission.`);
              delete currentFields[match[1]];
              removedAny = true;
            } else {
              // Try case-insensitive scan of existing keys in currentFields to see if any is mentioned in the error
              for (const key of Object.keys(currentFields)) {
                if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
                  console.log(`Self-healing protocol: Removing field "${key}" from Airtable submission because of error match.`);
                  delete currentFields[key];
                  removedAny = true;
                  break;
                }
              }
            }

            if (!removedAny) {
              // Fallback to only sending baseline fields if there's an unknown field but we couldn't match its key.
              const baselineKeys = ["Name", "Email", "Phone", "Company", "Source", "Timestamp"];
              let removedSome = false;
              for (const key of Object.keys(currentFields)) {
                if (!baselineKeys.includes(key)) {
                  delete currentFields[key];
                  removedSome = true;
                }
              }
              if (!removedSome) {
                // If we've already stripped down to baseline and it still errors, store error details and abort.
                airtableError = errorMessage;
                break;
              }
            }
          } else {
            // Non-schema error (like authentication patterns, base not found, size limitations, etc.)
            airtableError = errorMessage;
            break;
          }
        }
      } catch (err) {
        console.error("Connection to Airtable API timed out or failed:", err);
        airtableError = err instanceof Error ? err.message : "Network error / Connection failure";
      }
    }
  }

    return res.json({
      success: true,
      data: newLead,
      savedLocally,
      savedToAirtable,
      airtableStatus: pat && baseId ? (savedToAirtable ? "synced" : ((isWhatsApp || isNewsletter) ? "ignored" : "failed")) : "not_configured",
      airtableError
    });
  });

  // Dynamic sitemap.xml router endpoint detailing each main entry page
  app.get("/sitemap.xml", (req, res) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://memorate.org/</loc>
    <lastmod>2026-05-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://memorate.org/about</loc>
    <lastmod>2026-05-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://memorate.org/offers</loc>
    <lastmod>2026-05-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://memorate.org/insight</loc>
    <lastmod>2026-05-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://memorate.org/contact</loc>
    <lastmod>2026-05-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(sitemap);
  });

  // Expose robots.txt navigation directory to guide search crawlers and shield system endpoints
  app.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Sitemap: https://memorate.org/sitemap.xml`;

    res.header("Content-Type", "text/plain");
    res.status(200).send(robots);
  });

  // Robust Server Routing, Redirects, and Custom 404 Handling
  const VALID_CLIENT_ROUTES = ["/", "/about", "/offers", "/insight", "/contact", "/portal"];

  const REDIRECT_MAP: Record<string, string> = {
    "/pricing": "/offers",
    "/services": "/offers",
    "/growth": "/offers",
    "/blog": "/insight",
    "/articles": "/insight",
    "/assessments": "/contact",
    "/careers": "/about",
    "/team": "/about",
    "/admin": "/portal",
    "/signin": "/portal",
    "/dashboard": "/portal"
  };

  // 1. Permanent 301 Redirects for Legacy / Typo coordinates
  Object.entries(REDIRECT_MAP).forEach(([source, target]) => {
    app.get(source, (req, res) => {
      res.redirect(301, target);
    });
  });

  // 2. Map explicit clean URLs to the correct server or SPA assets
  VALID_CLIENT_ROUTES.forEach((route) => {
    app.get(route, async (req, res, next) => {
      if (process.env.NODE_ENV !== "production") {
        // Let Vite handle the clean route
        return next();
      } else {
        // Direct serve the optimized index.html
        const distPath = path.join(process.cwd(), "dist");
        return res.sendFile(path.join(distPath, "index.html"));
      }
    });
  });

  // 3. Catch-all router for unresolved assets or invalid coordinates
  app.get("*", async (req, res, next) => {
    const rawPath = req.path;

    // Skip API, static assets, internal Vite paths
    if (
      rawPath.startsWith("/api/") ||
      rawPath.startsWith("/@") ||
      rawPath.startsWith("/src/") ||
      rawPath.includes(".") ||
      req.headers.accept?.includes("text/css") ||
      req.headers.accept?.includes("image/")
    ) {
      return next();
    }

    // Serve custom brand-approved 404 page
    return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transmission Interrupted | Memorate</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&family=JetBrains+Mono&family=Inter:wght@300;450;650&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #0c0c0c;
      color: #ffffff;
      font-family: 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      text-align: center;
    }
    .container {
      max-width: 600px;
      padding: 40px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      background-color: rgba(255, 255, 255, 0.01);
      border-radius: 24px;
      position: relative;
    }
    .glow {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 200px;
      background-color: #AAFF00;
      filter: blur(100px);
      opacity: 0.08;
      pointer-events: none;
    }
    .protocol {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #AAFF00;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      margin-bottom: 20px;
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 44px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 0 0 16px 0;
    }
    p {
      color: #94a3b8;
      font-size: 15px;
      font-weight: 300;
      line-height: 1.6;
      margin: 0 auto 36px auto;
      max-width: 480px;
    }
    .actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .btn-primary {
      background-color: #AAFF00;
      color: #0c0c0c;
    }
    .btn-primary:hover {
      background-color: #ffffff;
      box-shadow: 0 4px 20px rgba(170, 255, 0, 0.2);
    }
    .btn-secondary {
      background-color: rgba(255, 255, 255, 0.05);
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .redirect-text {
      margin-top: 40px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #475569;
    }
  </style>
  <script>
    setTimeout(function() {
      window.location.href = "/";
    }, 7000);
  </script>
</head>
<body>
  <div class="container">
    <div class="glow"></div>
    <div class="protocol">Protocol Error: 404 Route Unresolved</div>
    <h1>Transmission Path Severed</h1>
    <p>The requested coordinate does not exist. We have intercepted your request and are steering you back to our active growth parameters.</p>
    <div class="actions">
      <a href="/" class="btn btn-secondary">Corporate Overview</a>
      <a href="/offers" class="btn btn-primary">Strategic Offerings ⚡</a>
    </div>
    <div class="redirect-text">
      Initiating automated safe realignment in <span id="countdown">7</span> seconds...
    </div>
  </div>
  <script>
    var sec = 7;
    var timer = setInterval(function() {
      sec--;
      document.getElementById('countdown').innerHTML = sec;
      if (sec <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  </script>
</body>
</html>`);
  });

  // Attach Vite as middleware for hot module/asset resolution or SPA routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
