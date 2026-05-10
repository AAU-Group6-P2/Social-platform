import { getEventJoinCount, joinEvent, undoJoinEvent } from "../services/clubServices.js";

export function formatEventJoinText(joined = 0) {
    return `Join event (${joined} joined)`;
}

export function formatJoinedEventText(joined = 0) {
    return `You are joined (${joined} joined) Undo`;
}

function updateEventJoinButton(button, joined = 0, isJoined = false) {
    button.textContent = isJoined
        ? formatJoinedEventText(joined)
        : formatEventJoinText(joined);
    button.classList.toggle("joined", isJoined);
}

export async function setupEventJoinButton(button, eventId) {
    if (!button || !eventId) return;

    button.type = "button";
    let isJoined = false;
    updateEventJoinButton(button, 0, isJoined);

    try {
        const countData = await getEventJoinCount(eventId);
        isJoined = Boolean(countData.isJoined);
        updateEventJoinButton(button, countData.joined ?? 0, isJoined);
    } catch (error) {
        console.error("Failed to load event join count:", error);
    }

    button.onclick = async () => {
        button.disabled = true;

        try {
            const result = isJoined
                ? await undoJoinEvent(eventId)
                : await joinEvent(eventId);

            if (result?.error) {
                alert(result.error);
                return;
            }

            isJoined = Boolean(result?.isJoined);
            updateEventJoinButton(button, result?.joined ?? 0, isJoined);
        } catch (error) {
            console.error("Failed to join event:", error);
        } finally {
            button.disabled = false;
        }
    };
}
