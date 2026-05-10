import {supabase} from "../Supabase.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

/*Get club info */
export const getClubs = async (req, res) => {
    const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .order("name", { ascending: true });

    if (error) return res.status(500).json(error);

    res.json(data);
};

/*Get the number of current joined members in a club*/
export const getClubJoinCount = async (req, res) => {
    const clubId = req.params.id;
    const userId = req.session.user?.id;

    const { count, error } = await supabase 
        .from("club_members")
        .select("*", {count: "exact", head: true}) //count the rows
        .eq("club_id", clubId)

    if (error) {
        return res.status(500).json(error);
    }

    let isJoined = false;
    if (userId) {
        const { data: existing, error: existingError } = await supabase
            .from("club_members")
            .select("club_id")
            .eq("club_id", clubId)
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle();

        if (existingError) {
            return res.status(500).json(existingError);
        }

        isJoined = Boolean(existing);
    }

    res.json({ joined: count, isJoined});
};

/* Update the database with new number of members in the club*/
export const joinClub = async (req, res) => {
    const userId = req.session.user?.id;
    const clubId = req.params.id;

    if(!userId){
        return res.status(401).json({ message: "Not logged in" });
    }

    const { data: existing, error: existingError } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("club_id", clubId)
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

    if (existingError) {
        return res.status(500).json(existingError);
    }

    if (!existing) {
        const { error } = await supabase
            .from("club_members")
            .insert([
                {
                    user_id: userId,
                    club_id: clubId
                }
            ]);

        if(error){
            return res.status(400).json({
                message: "Could not join this club"
            });
        }
    }

    //get the updated count of joined
    const { count, error: counterror } = await supabase 
        .from("club_members")
        .select("*", {count: "exact", head: true}) //count the rows
        .eq("club_id", clubId)
    
    if (counterror) {
        return res.status(500).json(counterror);
    }

    res.json({ 
        message: "Joined successfully",
        joined: count,
        isJoined: true
    });
};

/* Leave club */
export const leaveClub = async (req, res) => {
    const userId = req.session.user?.id;
    const clubId = req.params.id;

    if(!userId){
        return res.status(401).json({ message: "Not logged in" });
    }

    const { error } = await supabase
        .from("club_members")
        .delete()
        .eq("club_id", clubId)
        .eq("user_id", userId);

    if (error) {
        return res.status(500).json(error);
    }

    const { count, error: countError } = await supabase 
        .from("club_members")
        .select("*", {count: "exact", head: true})
        .eq("club_id", clubId);
    
    if (countError) {
        return res.status(500).json(countError);
    }

    res.json({ 
        message: "Club join removed",
        joined: count,
        isJoined: false
    });
};



/*Create a new club (student application) */
export const createClub = async (req, res) => {
    const { name, category, contactEmail, phone } = req.body;

    if (!name || !category) {
        return res.status(400).json({ error: "Name and category are required." });
    }

    // Get the current max id to assign the next one
    const { data: maxData, error: maxError } = await supabase
        .from("clubs")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .single();

    if (maxError && maxError.code !== "PGRST116") {
        return res.status(500).json(maxError);
    }

    const nextId = maxData ? maxData.id + 1 : 1;
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

    const { data, error } = await supabase
        .from("clubs")
        .insert([{
            id: nextId,
            name,
            category: capitalizedCategory,
            contactEmail: contactEmail || null,
            phone: phone || null
        }])
        .select()
        .single();

    if (error) return res.status(500).json(error);

    res.status(201).json(data);
};


/*Update club details */
export const updateClub = async (req, res) => {
    const clubId = req.params.id;
    const { regularDate, regularTime, regularPlace, description, contactEmail, phone, color } = req.body;

    // Check colour uniqueness if a colour is being set
    if (color) {
        const { data: existing } = await supabase
            .from("clubs")
            .select("id, color")
            .eq("color", color)
            .neq("id", clubId)
            .maybeSingle();

        if (existing) {
            return res.status(409).json({ error: "This colour is already taken by another club." });
        }
    }

    const updates = {};
    if (regularDate !== undefined) updates.regularDate = regularDate;
    if (regularTime !== undefined) updates.regularTime = regularTime;
    if (regularPlace !== undefined) updates.regularPlace = regularPlace;
    if (description !== undefined) updates.description = description;
    if (contactEmail !== undefined) updates.contactEmail = contactEmail;
    if (phone !== undefined) updates.phone = phone;
    if (color !== undefined) updates.color = color;

    const { data, error } = await supabase
        .from("clubs")
        .update(updates)
        .eq("id", clubId)
        .select()
        .single();

    if (error) return res.status(500).json(error);

    res.json(data);
};

/*Upload club image to Supabase Storage */
export const uploadClubImage = async (req, res) => {
    const clubId = req.params.id;

    if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
    }

    const ext = req.file.originalname.split(".").pop();
    const filePath = `${clubId}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from("club-images")
        .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
        });

    if (uploadError) return res.status(500).json(uploadError);

    const { data: urlData } = supabase.storage
        .from("club-images")
        .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    const { data, error } = await supabase
        .from("clubs")
        .update({ image: publicUrl })
        .eq("id", clubId)
        .select()
        .single();

    if (error) return res.status(500).json(error);

    res.json({ image: publicUrl, club: data });
};