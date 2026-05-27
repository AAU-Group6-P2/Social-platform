import { getJoinCount, joinClub, undoJoinClub } from "../services/clubServices.js";

function updateClubJoinButton(button, isJoined = false) {
    button.textContent = isJoined ? "You are joined | Undo" : "Join club";
    button.classList.toggle("joined", isJoined);
}

async function updateMemberCountText(clubId) {
    const members = await getJoinCount(clubId);

    document.getElementById("club-members-count").textContent = `${members.joined} members`;
}

export async function setupClubJoinButton(button, clubId) {
    if (!button || !clubId) return;

    button.type = "button";
    let isJoined = false;

    try {
        const countData = await getJoinCount(clubId);
        isJoined = countData.isJoined;
        updateClubJoinButton(button, isJoined);
    } catch (error) {
        console.error("Failed to load club join status:", error);
    }

    button.onclick = async () => {
        button.disabled = true;

        try {
            const result = isJoined
                ? await undoJoinClub(clubId)
                : await joinClub(clubId);

            if (!result) return;

            isJoined = Boolean(result.isJoined);
            updateClubJoinButton(button, isJoined);
            updateMemberCountText(clubId);
        } catch (error) {
            console.error("Failed to update club join:", error);
        } finally {
            button.disabled = false;
        }
    };
}
