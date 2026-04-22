/* Load clubs from backend */
export async function getClubs() {
    const response = await fetch("http://localhost:3000/clubs");
    const data = await response.json();
    return data;
}

/* Load events from backend */
export async function getEvent() {
    const response = await fetch("http://localhost:3000/events");
    const data = await response.json();
    return data;
}
