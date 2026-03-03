import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function GET(request) {
  try {
    if (!DATABASE_ID || !process.env.NOTION_TOKEN) {
      return Response.json(
        { error: "Missing NOTION_TOKEN or NOTION_DATABASE_ID" },
        { status: 400 }
      );
    }

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    const trades = response.results.map((page) => {
      const props = page.properties;

      // Extract values from Notion properties
      const getTextValue = (prop) => {
        if (!prop) return "";
        if (prop.type === "title" && prop.title?.length > 0)
          return prop.title[0].plain_text;
        if (prop.type === "rich_text" && prop.rich_text?.length > 0)
          return prop.rich_text[0].plain_text;
        return "";
      };

      const getNumberValue = (prop) => {
        return prop?.number || 0;
      };

      const getSelectValue = (prop) => {
        return prop?.select?.name || "";
      };

      const getCheckboxValue = (prop) => {
        return prop?.checkbox || false;
      };

      const getDateValue = (prop) => {
        return prop?.date?.start || new Date().toISOString().split("T")[0];
      };

      return {
        id: page.id,
        date: getDateValue(props.Date),
        pair: getTextValue(props.Pair),
        session: getSelectValue(props.Session),
        setup: getSelectValue(props.Setup),
        outcome: getSelectValue(props.Outcome),
        pnl: getNumberValue(props["P&L"]),
        r: getNumberValue(props.R),
        risk: getNumberValue(props.Risk),
        sopOk: getCheckboxValue(props["SOP OK"]),
        exec: getNumberValue(props.Execution),
      };
    });

    return Response.json({ trades });
  } catch (error) {
    console.error("Notion API error:", error);
    return Response.json(
      { error: "Failed to fetch trades from Notion" },
      { status: 500 }
    );
  }
}
