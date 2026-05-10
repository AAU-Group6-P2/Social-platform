import {supabase} from "../Supabase.js";


/*Get event info */
export const getEvents = async (req, res) => {
    const { data, error } = await supabase
        .from("events")
        .select(`
            *,
            clubs(color)
        `);

    if (error) return res.status(500).json(error);

    res.json(data);
};

/*Create event */
export const createEvent = async (req, res) => {
    const {
        name,
        date,
        timeStart,
        timeEnd,
        clubId,
        location,
        description,
        practicalInformation,
        isPublished
    } = req.body;

    if (!name || !date || !timeStart || !timeEnd || !clubId || !location || !description) {
        return res.status(400).json({
            error: "Missing required event fields."
        });
    }

    // combine time in backend
    const time = `${timeStart} - ${timeEnd}`
    
    const { data, error } = await supabase
        .from("events")
        .insert([{
            title: name, //this maps frontend "name" to database "title" coulmn
            date,
            time,
            clubId: Number(clubId),
            location,
            description,
            practicalInfo: practicalInformation, 
            isPublished: Boolean(isPublished)
        }])
        .select()
        .single();

    if (error) return res.status(500).json(error);

    res.status(201).json(data);
};

/* Get current number of joined users for an event */
export const getEventJoinCount = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.user?.id;

    const { count, error } = await supabase
        .from("event_joined")
        .select("*", { count: "exact", head: true}) //count the rows 
        .eq("event_id", eventId)

    if(error){
        return res.status(500).json(error);
    } 

    let isJoined = false;
    if (userId) {
        const { data: existing, error: existingError } = await supabase
            .from("event_joined")
            .select("event_id")
            .eq("event_id", eventId)
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle();

        if (existingError) {
            return res.status(500).json(existingError);
        }

        isJoined = Boolean(existing);
    }

    res.json({ joined: count, isJoined });
};


/* Increment joined count for an event */
export const joinEvent = async (req, res) => {
    const userId = req.session.user?.id;
    const eventId = req.params.id;

    if(!userId){
        return res.status(401).json({ message: "Not logged in" });
    }

    const { data: existing, error: existingError } = await supabase
        .from("event_joined")
        .select("event_id")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

    if (existingError) {
        return res.status(500).json(existingError);
    }

    if (!existing) {
        const { error } = await supabase
            .from("event_joined")
            .insert([
                {
                    user_id: userId,
                    event_id: eventId
                }
            ]);

        if (error) {
            return res.status(400).json({ message: "Could not join this event" });
        }
    }

    //get the updated count of joined
    const { count, error: countError } = await supabase 
        .from("event_joined")
        .select("*", {count: "exact", head: true}) //count the rows
        .eq("event_id", eventId)
    
    if (countError) {
        return res.status(500).json(countError);
    }

    res.json({ 
        joined: count,
        isJoined: true
    });
};

/* Undo join for an event */
export const leaveEvent = async (req, res) => {
    const userId = req.session.user?.id;
    const eventId = req.params.id;

    if(!userId){
        return res.status(401).json({ message: "Not logged in" });
    }

    const { error } = await supabase
        .from("event_joined")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

    if (error) {
        return res.status(500).json(error);
    }

    const { count, error: countError } = await supabase 
        .from("event_joined")
        .select("*", {count: "exact", head: true})
        .eq("event_id", eventId);
    
    if (countError) {
        return res.status(500).json(countError);
    }

    res.json({
        joined: count,
        isJoined: false
    });
};

/*Update event details */
export const updateEvent = async (req, res) => {
    const eventId = req.params.id;
    const { timeStart, timeEnd, title, date, location, description, practicalInfo } = req.body;

    if (!timeStart || !timeEnd) {
        return res.status(400).json({ error: "timeStart and timeEnd are required." });
    }

    const updates = { time: `${timeStart} - ${timeEnd}` };
    if (title !== undefined) updates.title = title;
    if (date !== undefined) updates.date = date;
    if (location !== undefined) updates.location = location;
    if (description !== undefined) updates.description = description;
    if (practicalInfo !== undefined) updates.practicalInfo = practicalInfo;

    const { data, error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", eventId)
        .select()
        .single();

    if (error) return res.status(500).json(error);

    res.json(data);
};