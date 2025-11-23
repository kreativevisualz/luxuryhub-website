import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // --- 1. SEND TO NOTION ---
    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_SECRET}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB },
        properties: {
          "Full Name": { title: [{ text: { content: data.name } }] },
          "Phone": { number: Number(data.phone) },
          "Email": { email: data.email },
          "Service": { select: { name: data.service } },
          "Location": { select: { name: data.location } },
          "Notes": { rich_text: [{ text: { content: data.notes || "" } }] },
          "Booking Date": { date: { start: data.date } },
          "Booking Status": { select: { name: "Pending" } },
          "Submitted At": { date: { start: new Date().toISOString() } }
        }
      })
    });

    // --- 2. SEND EMAIL VIA EMAILJS ---
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE,
        template_id: process.env.EMAILJS_TEMPLATE,
        user_id: process.env.EMAILJS_PUBLIC,
        template_params: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          date: data.date,
          service: data.service,
          location: data.location,
          notes: data.notes || ""
        }
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
