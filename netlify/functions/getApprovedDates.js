// netlify/functions/getApprovedDates.js
import fetch from "node-fetch";

export async function handler() {
  try {
    const notionSecret = process.env.NOTION_SECRET;
    const notionDb = process.env.NOTION_DB;

    const today = new Date();
    const currentMonth = today.getMonth();  // 0–11
    const currentYear = today.getFullYear();

    const response = await fetch(`https://api.notion.com/v1/databases/${notionDb}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionSecret}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: "Booking Status", select: { equals: "Approved" } },
            { property: "Booking Date", date: { is_not_empty: true } }
          ]
        }
      })
    });

    const data = await response.json();
    if (!data.results) {
      return {
        statusCode: 200,
        body: JSON.stringify({ approvedDays: [] })
      };
    }

    const approvedDays = [];

    data.results.forEach(page => {
      const dateStr = page.properties["Booking Date"].date.start;
      const dt = new Date(dateStr);

      if (dt.getMonth() === currentMonth && dt.getFullYear() === currentYear) {
        approvedDays.push(dt.getDate());
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ approvedDays })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
