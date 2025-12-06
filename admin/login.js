document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if(user === "lebo" && pass === "luxury123") {
        sessionStorage.setItem("lhl_admin", "true");
        window.location.href = "admin.html";
    } else {
        document.getElementById('error').classList.remove('hidden');
    }
});