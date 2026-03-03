import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function GET(request) {
  try {
    if (!DATABASE_ID || !process.env.NOTION_TOKEN) {
      return Response.json(
        { error: "Missing NOTION_TOKEN or NOTION_DATABASE_ID" },
        { status: 400 }
      );
    }

    let allResults = [];
    let cursor = undefined;

    do {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [{ property: "Date", direction: "ascending" }],
        ...(cursor ? { start_cursor: cursor } : {}),
      });
      allResults = [...allResults, ...response.results];
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    const trades = allResults.map((page) => {
      const p = page.properties;

      const title  = (k) => p[k]?.title?.[0]?.plain_text || "";
      const text   = (k) => p[k]?.rich_text?.[0]?.plain_text || "";
      const num    = (k) => p[k]?.number ?? 0;
      const sel    = (k) => p[k]?.select?.name || "";
      const date   = (k) => p[k]?.date?.start || "";
      const msel   = (k) => p[k]?.multi_select?.map(s => s.name) || [];
      const url    = (k) => p[k]?.url || "";

      return {
        id:           page.id,
        name:         title("Trade #"),
        date:         date("Date"),
        pair:         sel("Pair"),
        session:      sel("Session"),
        direction:    sel("Direction"),
        setup:        sel("Setup Type"),
        htfBias:      sel("HTF Bias"),
        phase:        sel("Phase"),
        rrPlanned:    num("RR Planned"),
        outcome:      sel("Outcome"),
        pnl:          num("PnL USD"),
        rMultiple:    num("R Multiple"),
        execGrade:    sel("Execution Grade"),
        sopOk:        sel("SOP Followed?") === "Yes ✅",
        sopViolation: sel("SOP Violation"),
        whatWorked:   text("What Worked"),
        whatToImprove:text("What To Improve"),
        tags:         msel("Tags"),
      };
    }).filter(t => t.date && t.outcome && !t.outcome.includes("Running"));

    return Response.json({ trades, count: allResults.length });

  } catch (error) {
    console.error("Notion API error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!DATABASE_ID || !process.env.NOTION_TOKEN) {
      return Response.json(
        { error: "Missing NOTION_TOKEN or NOTION_DATABASE_ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const page = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        "Trade #": {
          title: [{ text: { content: body.name || `Trade ${new Date().toLocaleDateString()}` } }],
        },
        "Date": {
          date: { start: body.date },
        },
        "Pair": {
          select: { name: body.pair },
        },
        "Session": {
          select: { name: body.session },
        },
        "Direction": {
          select: { name: body.direction },
        },
        "Setup Type": {
          select: { name: body.setup },
        },
        "HTF Bias": {
          select: { name: body.htfBias },
        },
        "Phase": {
          select: { name: body.phase },
        },
        "RR Planned": {
          number: parseFloat(body.rrPlanned) || 0,
        },
        "Outcome": {
          select: { name: body.outcome },
        },
        "PnL USD": {
          number: parseFloat(body.pnl) || 0,
        },
        "R Multiple": {
          number: parseFloat(body.rMultiple) || 0,
        },
        "Execution Grade": {
          select: { name: body.execGrade },
        },
        "SOP Followed?": {
          select: { name: body.sopOk ? "Yes ✅" : "No ❌" },
        },
        "SOP Violation": {
          rich_text: [{ text: { content: body.sopViolation || "" } }],
        },
        "What Worked": {
          rich_text: [{ text: { content: body.whatWorked || "" } }],
        },
        "What To Improve": {
          rich_text: [{ text: { content: body.whatToImprove || "" } }],
        },
        "Tags": {
          multi_select: (body.tags || []).map(tag => ({ name: tag })),
        },
      },
    });

    return Response.json({ success: true, id: page.id });

  } catch (error) {
    console.error("Notion API create error:", error);
    return Response.json(
      { error: error.message || "Failed to create trade" },
      { status: 500 }
    );
  }
}
