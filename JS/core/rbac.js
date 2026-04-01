
/* permissions-system Her er roller og premissions defineret 
Vi angiver hvad de forskellige bruger må se af fx knapper

så kan vi senere i koden tjekke om brugeren har rettighed til at tilgå en knap ved:
if (hasPermission(role, "create_event")) {
    // vis create event knap
}
*/

export const roles = {
    user: [ /*dette er eksempler på rettigheder user skal have så hvad de må se*/
        "view_events",
        "signup_event",
        "view_clubs",
        "apply_create_club",
        "view_calendar",
        "filter_clubs"
    ],
    club_owner: [
       "view_events",
        "signup_event",
        "view_clubs",
        "view_calendar",
        "create_event",
        "edit_own_event",
        "send_notifications"
    ],
    admin: [
        "view_events",
        "signup_event",
        "view_clubs",
        "view_calendar",
        "create_event",
        "edit_any_event",
        "manage_clubs",
        "publish_event",
        "delete_event"
    ]
};

export function hasPermission(role, permission) {
    return roles[role]?.includes(permission);
}