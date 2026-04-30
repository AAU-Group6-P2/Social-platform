// Hent knapperne. Finder knapperne i HTML ud fra deres id
const btnStudent = document.getElementById("goDashboardStudent");
const btnClubOwner = document.getElementById("goDashboardClubOwner");


async function login(role) {
    const res = await fetch("/login-demo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ role })
    });

    const data = await res.text();

    if (res.ok) {
        window.location.href = role === "student"
            ? "/student/index"
            : "/owner/index";
    } else {
        console.error("Login failed:", data);
    }
}

btnStudent.addEventListener("click", () => login("student"));
btnClubOwner.addEventListener("click", () => login("club_owner"));