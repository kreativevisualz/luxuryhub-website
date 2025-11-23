/* =========================================================
   ELEMENT REFERENCES
========================================================= */
const calendar = document.getElementById("calendar");
const bookingModal = document.getElementById("bookingModal");
const closeBtn = document.querySelector(".close-btn");

const bookingForm = document.getElementById("bookingForm");
const selectedDateInput = document.getElementById("selectedDate");

const nameInput = document.getElementById("name");
const serviceInput = document.getElementById("service");
const locationInput = document.getElementById("location");

/* =========================================================
   NOTION SETUP
========================================================= */
const NOTION_SECRET = process.env.NOTION_SECRET;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function fetchApprovedDays() {
  try {
    const response = await fetch("https://api.notion.com/v1/databases/" + NOTION_DATABASE_ID + "/query", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_SECRET}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: {
          property: "Booking Status",
          select: { equals: "Approved" }
        }
      })
    });

    const data = await response.json();
    const approvedDates = data.results.map(p => p.properties["Booking Date"].date.start);

    return approvedDates; // list of yyyy-mm-dd
  } catch (error) {
    console.error("Error fetching approved days:", error);
    return [];
  }
}

/* =========================================================
   CALENDAR GENERATION
========================================================= */
async function generateCalendar(year, month) {
  calendar.innerHTML = "";

  // Get approved days list from Notion
  const approvedDates = await fetchApprovedDays();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const totalDays = monthEnd.getDate();

  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = day;

    const dateObj = new Date(year, month, day);
    const iso = dateObj.toISOString().split("T")[0];

    // Mark approved days (greyed-out)
    if (approvedDates.includes(iso)) {
      dayDiv.classList.add("booked");
      dayDiv.title = "Fully booked";
    } else {
      // Open modal for available dates
      dayDiv.addEventListener("click", () => openBookingModal(iso));
    }

    calendar.appendChild(dayDiv);
  }
}

/* =========================================================
   MODAL OPEN / CLOSE
========================================================= */
function openBookingModal(isoDate) {
  selectedDateInput.value = new Date(isoDate).toDateString();
  bookingModal.style.display = "flex";
}

closeBtn.addEventListener("click", () => {
  bookingModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === bookingModal) {
    bookingModal.style.display = "none";
  }
});

/* =========================================================
   SEND TO NOTION + EMAILJS
========================================================= */
async function addBookingToNotion(date, name, service, location) {
  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_SECRET}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          "Full Name": { title: [{ text: { content: name } }] },
          "Service": { select: { name: service } },
          "Location": { select: { name: location } },
          "Booking Date": { date: { start: date } },
          "Booking Status": { select: { name: "Pending" } }
        }
      })
    });

    return await response.json();
  } catch (error) {
    console.error("Error inserting into Notion:", error);
  }
}

async function sendEmail(date, name, service, location) {
  return emailjs.send("service_6mvxrqw", "template_j5qlofp", {
    date,
    name,
    service,
    location
  }, "gOHD01j5t52qgFfeE");
}

/* =========================================================
   FORM SUBMIT HANDLER
========================================================= */
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const date = selectedDateInput.value;
  const name = nameInput.value.trim();
  const service = serviceInput.value;
  const location = locationInput.value;

  if (!name || service === "Select Service" || location === "Select Location") {
    alert("Please complete all fields.");
    return;
  }

  // Convert to ISO (Notion format)
  const isoDate = new Date(date).toISOString().split("T")[0];

  // Save in Notion
  await addBookingToNotion(isoDate, name, service, location);

  // Send email
  await sendEmail(date, name, service, location);

  alert("Booking submitted! Lebo will confirm shortly.");

  bookingModal.style.display = "none";
  bookingForm.reset();

  // Refresh calendar so approved days grey out automatically
  const today = new Date();
  generateCalendar(today.getFullYear(), today.getMonth());
});

/* =========================================================
   INIT CALENDAR
========================================================= */
const today = new Date();
generateCalendar(today.getFullYear(), today.getMonth());
