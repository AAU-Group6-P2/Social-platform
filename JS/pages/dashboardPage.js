// Hent rolle fra sessionStorage


const role = localStorage.getItem("role");
const roleText = document.getElementById("roleText");

roleText.textContent = role
    ? `You are logged in as ${role}`
    : `No role selected`

/* hent tilbage knappen*/
const goBackToLoginPage = document.getElementById("goBackToLoginPage");

/* Redirect til index.html(login page) */
goBackToLoginPage.addEventListener("click", () => {
    window.location.href = "index.html";
});