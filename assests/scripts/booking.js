// === ELEMENT REFERENCES ===
const calendar = document.getElementById("calendar");
const bookingModal = document.getElementById("bookingModal");
const closeBtn = document.querySelector(".close-btn");
const selectedDateInput = document.getElementById("selectedDate");

function generateCalendar(year, month) {
  calendar.innerHTML = ""; // clear previous calendar

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const totalDays = monthEnd.getDate();

  // Example booked days — these will be locked
  const bookedDays = [3, 7, 12, 21];

  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = day;

    // Mark booked days
    if (bookedDays.includes(day)) {
      dayDiv.classList.add("booked");
      dayDiv.title = "Fully booked";
    } else {
      // Only clickable if not booked
      dayDiv.addEventListener("click", () => openBookingModal(day));
    }

    calendar.appendChild(dayDiv);
  }
}

function openBookingModal(day) {
  const now = new Date();
  const selectedDate = new Date(now.getFullYear(), now.getMonth(), day);

  selectedDateInput.value = selectedDate.toDateString();
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

const today = new Date();
generateCalendar(today.getFullYear(), today.getMonth());
