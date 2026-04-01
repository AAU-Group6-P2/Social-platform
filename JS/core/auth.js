/* Her gemmes brugerens rolle når de logger ind */

export function login(username, password) {
    // Simpel test-login (kun til prototyping)
    if (username === "admin") {
        sessionStorage.setItem("role", "admin");
    } else if (username === "club") {
        sessionStorage.setItem("role", "club_owner");
    } else {
        sessionStorage.setItem("role", "user");
    }

    // Redirect til dashboard efter login
    window.location.href = "dashboard.html";
}