
import { supabase } from './supabase.js';


// ========================================
// 1. GET CURRENT USER
// ========================================

async function getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session?.user ?? null;
}


// ========================================
// 2. GET ALL USER BOOKMARKS
// ========================================

export async function getBookmarks() {
    const user = await getCurrentUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('bookmarks')
        .select('id, user_id, opportunity_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}


// ========================================
// 3. ADD BOOKMARK
// ========================================

export async function addBookmark(opportunityId) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Please log in to save bookmarks.');
    }

    const { data, error } = await supabase
        .from('bookmarks')
        .insert({
            user_id: user.id,
            opportunity_id: opportunityId
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}


// ========================================
// 4. REMOVE BOOKMARK
// ========================================

export async function removeBookmark(opportunityId) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Please log in to remove bookmarks.');
    }

    const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId);

    if (error) {
        throw error;
    }

    return true;
}


// ========================================
// 5. CHECK BOOKMARK STATUS
// ========================================

export async function isBookmarked(opportunityId) {
    const user = await getCurrentUser();

    if (!user) {
        return false;
    }

    const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data !== null;
}


// ========================================
// 6. TOGGLE BOOKMARK
// ========================================

export async function toggleBookmark(opportunityId) {
    const saved = await isBookmarked(opportunityId);

    if (saved) {
        await removeBookmark(opportunityId);
        return false;
    }

    await addBookmark(opportunityId);
    return true;
}
