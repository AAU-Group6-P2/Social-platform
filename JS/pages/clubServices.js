

/*Load in the clubs */
export async function getClubs(){
    const response = await fetch("data/club_card.json");
    const data = await response.json();
    return data;
}