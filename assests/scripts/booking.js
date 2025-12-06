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
const currentLocationText = document.getElementById("current-location");

/* =========================================================
   CONFIGURATION
========================================================= */
// ⚠️ PASTE YOUR BIN ID HERE
const BIN_ID = "69340d57ae596e708f873be1";
const MASTER_KEY = "$2a$10$KN6bAogNbm.B.WYSut0/zOdIrYZa9xhgV.7quV4sBu/BaTxdLom0u"; // <--- NEW (Security Risk!)

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

/* =========================================================
   DATA FETCHING (UPDATED to use JSONBin)
========================================================= */
async function fetchApprovedDays() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network error");
    
    const data = await response.json();
    const record = data.record;

    // 1. UPDATE LOCATION TEXT ON HOMEPAGE
    if (record.currentLocation && currentLocationText) {
        currentLocationText.textContent = record.currentLocation;
    }

    // 2. EXTRACT BOOKINGS
    const allBookings = record.bookings || [];
    
    // Filter for approved dates
    const unavailableDates = allBookings
      .filter(booking => booking.status === "Approved")
      .map(booking => booking.date);
      
    return unavailableDates;
    
  } catch (error) {
    console.error("Could not fetch data:", error);
    return [];
  }
}

/* =========================================================
   CALENDAR GENERATION (Preserved Logic)
========================================================= */
async function generateCalendar(year, month) {
  if (!calendar) return;
  
  calendar.innerHTML = "";

  // 1. Get List of unavailable dates (Now from Cloud)
  const approvedDates = await fetchApprovedDays();

  // 2. Setup dates
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  // Empty slots
  for (let i = 0; i < firstDayIndex; i++) {
     const emptyDiv = document.createElement("div");
     calendar.appendChild(emptyDiv);
  }

  // 3. Create Days
  for (let day = 1; day <= lastDay; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = day;

    const currentMonthStr = String(month + 1).padStart(2, "0");
    const currentDayStr = String(day).padStart(2, "0");
    const isoDate = `${year}-${currentMonthStr}-${currentDayStr}`;

    // Mark approved days
    if (approvedDates.includes(isoDate)) {
      dayDiv.classList.add("booked");
      dayDiv.title = "Fully booked";
      // No click listener added for booked days
    } else {
      dayDiv.classList.add("available");
      dayDiv.addEventListener("click", () => openBookingModal(isoDate));
    }

    calendar.appendChild(dayDiv);
  }
}

/* =========================================================
   MODAL OPEN / CLOSE
========================================================= */
function openBookingModal(isoDate) {
  if(selectedDateInput) {
    selectedDateInput.value = isoDate;
  }
  // If CSS uses .active or just display logic:
  if(bookingModal.classList) bookingModal.classList.add("active");
  bookingModal.style.display = "flex";
}

if(closeBtn) {
    closeBtn.addEventListener("click", () => {
        bookingModal.style.display = "none";
    });
}

window.addEventListener("click", (e) => {
  if (e.target === bookingModal) {
    bookingModal.style.display = "none";
  }
});

/* =========================================================
   EMAIL FUNCTIONALITY (Preserved)
========================================================= */
async function sendEmail(date, name, service, location) {
    if (typeof emailjs !== "undefined") {
        return emailjs.send("service_6mvxrqw", "template_j5qlofp", {
            date,
            name,
            service,
            location
        });
    } else {
        console.warn("EmailJS not loaded");
    }
}

/* =========================================================
   FORM SUBMIT HANDLER
========================================================= */
if(bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = selectedDateInput.value;
    const name = nameInput.value.trim();
    const phone = document.getElementById("phone").value;
    const service = serviceInput.value;
    const location = locationInput.value;
    const notes = document.getElementById("notes").value;

    if (!name || !phone || service === "Select Service" || location === "Select Location") {
        alert("Please complete all fields.");
        return;
    }

    const submitBtn = bookingForm.querySelector(".submit-btn");
    submitBtn.textContent = "Processing...";
    submitBtn.disabled = true;

    try {
        // STEP 1: Send Email (Notification)
        // Ensure you have configured emailjs in booking.html
        if (typeof emailjs !== "undefined") {
             await emailjs.send("service_6mvxrqw", "template_j5qlofp", {
                date, name, phone, service, location ,notes
            });
        }

        // STEP 2: Fetch Current Database (To avoid deleting existing bookings)
        const fetchRes = await fetch(API_URL + "/latest", {
            method: "GET",
            headers: { "X-Master-Key": MASTER_KEY }
        });
        
        const jsonData = await fetchRes.json();
        let currentRecord = jsonData.record;

        // Safety check
        if(!currentRecord.bookings) currentRecord.bookings = [];

        // STEP 3: Add New Booking to List
        currentRecord.bookings.push({
            date: date,
            name: name,
            phone: phone,
            service: service,
            location: location,
            notes: notes,
            status: "Pending",  // AUTOMATIC status is pending
            created_at: new Date().toISOString()
        });

        // STEP 4: Save Back to JSONBin
        await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": MASTER_KEY
            },
            body: JSON.stringify(currentRecord)
        });

        // DONE
        alert("Booking Received! We have your details. Status: Pending Approval.");
        bookingModal.style.display = "none";
        bookingForm.reset();

        // Optional: Refresh calendar immediately
        // (Though pending dates don't show as blocked until you approve them)
        const today = new Date();
        generateCalendar(today.getFullYear(), today.getMonth());

    } catch (error) {
        console.error("Booking Error:", error);
        alert("System error. Please message us on WhatsApp directly.");
    } finally {
        submitBtn.textContent = "Confirm Booking";
        submitBtn.disabled = false;
    }
    });
}

/* =========================================================
   INIT CALENDAR
========================================================= */
const initDate = new Date();
generateCalendar(initDate.getFullYear(), initDate.getMonth());