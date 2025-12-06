// Auth Check
if(!sessionStorage.getItem("lhl_admin")) window.location.href = "login.html";

// CONFIG
const BIN_ID = "69340d57ae596e708f873be1"; 
const MASTER_KEY = "$2a$10$KN6bAogNbm.B.WYSut0/zOdIrYZa9xhgV.7quV4sBu/BaTxdLom0u"; 
const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let dataCache = { 
    currentLocation: "", 
    bookings: [] 
};

// DOM Elements
const tableBody = document.getElementById("tableBody");
const loading = document.getElementById("loading");
const locationInput = document.getElementById("adminLocation");

document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("lhl_admin");
    window.location.href = "../index.html";
});

// 1. Fetch Data
async function loadData() {
    try {
        const res = await fetch(URL + "/latest", {
            headers: { "X-Master-Key": MASTER_KEY }
        });
        const json = await res.json();
        
        // SAVE ENTIRE RECORD TO CACHE
        dataCache = json.record;

        // ENSURE DEFAULTS IF EMPTY
        if (!dataCache.bookings) dataCache.bookings = [];
        if (!dataCache.currentLocation) dataCache.currentLocation = "Klerksdorp";

        // POPULATE UI
        locationInput.value = dataCache.currentLocation; // Fill input
        renderTable();
        
        if(loading) loading.style.display = "none";

    } catch(e) { 
        console.error(e);
        alert("Error loading data"); 
    }
}

// 2. Save Data
async function saveData() {
    // ALWAYS GRAB LATEST LOCATION FROM INPUT BEFORE SAVING
    if(locationInput) {
        dataCache.currentLocation = locationInput.value; 
    }

    // SHOW LOADER
    if(loading) loading.style.display = "block";

    await fetch(URL, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "X-Master-Key": MASTER_KEY 
        },
        body: JSON.stringify(dataCache)
    });
    
    if(loading) loading.style.display = "none";
    renderTable();
}

//LocationButton

async function updateLocation() {
    await saveData(); // Reuses the main save logic
    alert("Location updated on website!");
}

// 3. Render
function renderTable() {
    tableBody.innerHTML = "";
    // Sort by date
    dataCache.bookings.sort((a,b) => new Date(a.date) - new Date(b.date));

    dataCache.bookings.forEach((b, i) => {
        const row = `<tr>
            <td>${b.date} <br> <small>${b.service}</small></td>
            <td>${b.name}</td>
            <td class="${b.status.toLowerCase()}">${b.status}</td>
            <td>
                ${b.status !== 'Approved' ? `<button class="app" onclick="approve(${i})">Approve</button>` : ''}
                <button class="del" onclick="remove(${i})">Delete</button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// 4. Actions
window.approve = async (index) => {
    dataCache.bookings[index].status = "Approved";
    await saveData();
};

window.remove = async (index) => {
    if(confirm("Delete this booking?")) {
        dataCache.bookings.splice(index, 1);
        await saveData();
    }
};

// 5. Add New Manual
document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = document.getElementById("newDate").value;
    const name = document.getElementById("newName").value;
    const service = document.getElementById("newService").value;
    
    dataCache.bookings.push({
        date, name, service, location: "Admin Added", status: "Approved"
    });
    await saveData();
    e.target.reset();
});

loadData();