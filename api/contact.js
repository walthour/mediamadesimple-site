// Media Made Simple — contact form handler
// POSTs every submission to Walt as a Slack DM via the Antigravity Agent bot.
// Env vars (set in Vercel project settings):
//   SLACK_BOT_TOKEN  — xoxb-... token for the Antigravity Agent bot
//   SLACK_USER_ID    — Walt's Slack user ID (e.g. U03DAUNPKJB)

const SLACK_API = "https://slack.com/api";

async function slack(method, token, body) {
  const res = await fetch(`${SLACK_API}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`slack.${method} failed: ${data.error || "unknown"}`);
  }
  return data;
}

function clean(v, max = 2000) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

module.exports = async (req, res) => {
  // CORS: same-origin only, but allow simple preflight in case browser sends it
  res.setHeader("Vary", "Origin");
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const token = process.env.SLACK_BOT_TOKEN;
  const userId = process.env.SLACK_USER_ID;
  if (!token || !userId) {
    return res.status(500).json({ ok: false, error: "server_not_configured" });
  }

  // Parse body (Vercel auto-parses JSON; also support form-encoded)
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // form-encoded fallback
      body = Object.fromEntries(new URLSearchParams(body));
    }
  }
  body = body || {};

  // Honeypot — bots happily fill hidden fields; humans don't see them
  if (clean(body.company_website)) {
    return res.status(200).json({ ok: true, spam: true });
  }

  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  const website = clean(body.website, 500);
  const offer = clean(body.offer, 1500);
  const budget = clean(body.budget, 200);
  const notes = clean(body.notes, 1500);

  if (!name || !email || !isEmail(email)) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }

  // Open DM with Walt
  let channel;
  try {
    const conv = await slack("conversations.open", token, { users: userId });
    channel = conv.channel && conv.channel.id;
    if (!channel) throw new Error("no_channel_id");
  } catch (err) {
    console.error("conversations.open failed:", err.message);
    return res.status(502).json({ ok: false, error: "slack_open_failed" });
  }

  // Compose Block Kit message
  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "🎯 New lead — mediamadesimple.co", emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Name*\n${name}` },
        { type: "mrkdwn", text: `*Email*\n<mailto:${email}|${email}>` },
        { type: "mrkdwn", text: `*Website*\n${website ? `<${website.startsWith("http") ? website : "https://" + website}|${website}>` : "_(none)_"}` },
        { type: "mrkdwn", text: `*Budget*\n${budget || "_(none)_"}` },
      ],
    },
  ];
  if (offer) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*Products / services:*\n${offer}` },
    });
  }
  if (notes) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*Anything else:*\n${notes}` },
    });
  }
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `📩 from \`${req.headers["x-forwarded-for"] || "unknown"}\` · ${new Date().toISOString()}`,
      },
    ],
  });

  const fallback = `New lead: ${name} <${email}>${website ? " — " + website : ""}`;

  try {
    await slack("chat.postMessage", token, {
      channel,
      text: fallback,
      blocks,
      unfurl_links: false,
      unfurl_media: false,
    });
  } catch (err) {
    console.error("chat.postMessage failed:", err.message);
    return res.status(502).json({ ok: false, error: "slack_post_failed" });
  }

  return res.status(200).json({ ok: true });
};
