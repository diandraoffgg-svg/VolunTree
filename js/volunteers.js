import { supabase } from './supabase.js';

// Mengambil seluruh volunteer yang sudah disetujui
export async function getVolunteers() {
    const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select(`
            id,
            title,
            description,
            category_id,
            organization_name,
            location,
            country_code,
            scope,
            participation_mode,
            minimum_age,
            maximum_age,
            cost_amount,
            currency_code,
            funding_type,
            start_date,
            end_date,
            registration_deadline,
            registration_url,
            image_url,
            status,
            created_at,
            volunteer_categories (
                id,
                slug,
                name_en,
                name_id
            )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

// Mengambil seluruh kategori volunteer
export async function getCategories() {
    const { data, error } = await supabase
        .from('volunteer_categories')
        .select(`
            id,
            slug,
            name_en,
            name_id,
            description_en,
            description_id
        `)
        .order('name_en', { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}