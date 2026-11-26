import { supabase } from './supabase.js';

// ========================================
// 1. GET CURRENT USER
// ========================================

async function getCurrentUser() {

    const { data, error } =
        await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session?.user ?? null;

}

// ========================================
// 2. NORMALIZE TEXT
// ========================================

function normalizeText(value) {

    if (value === null || value === undefined) {
        return null;
    }

    const text = String(value).trim();

    return text === '' ? null : text;

}

// ========================================
// 3. VALIDATE URL
// ========================================

function validateUrl(value) {

    if (!value) {
        return false;
    }

    if (/\s/.test(value)) {
        return false;
    }

    try {

        const url = new URL(value);

        return (
            ['http:', 'https:'].includes(url.protocol)
            && Boolean(url.hostname)
            && !url.username
            && !url.password
        );

    } catch {

        return false;

    }

}

// ========================================
// 4. VALIDATE EXPERIENCE
// ========================================

function validateExperience(post) {

    // Required title
    if (!post.title) {
        throw new Error('Title is required.');
    }

    // Required content
    if (!post.content) {
        throw new Error('Content is required.');
    }

    // Required category
    if (!post.category_id) {
        throw new Error('Category is required.');
    }

    // Required post type
    if (!post.post_type) {
        throw new Error('Post type is required.');
    }

    // Validate post type
    const allowedPostTypes = [
        'experience',
        'tips'
    ];

    if (!allowedPostTypes.includes(post.post_type)) {
        throw new Error('Invalid post type.');
    }

    // Validate optional image URL
    if (
        post.image_url &&
        !validateUrl(post.image_url)
    ) {
        throw new Error('Invalid image URL.');
    }

}

// ========================================
// 5. GET APPROVED EXPERIENCES
// ========================================

export async function getExperiences() {

    const { data, error } = await supabase

        .from('experience_posts')

        .select(`
            id,
            title,
            content,
            post_type,
            category_id,
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

        .order('created_at', {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return data;

}

// ========================================
// 6. GET EXPERIENCE BY ID
// ========================================

export async function getExperienceById(postId) {

    const { data, error } = await supabase

        .from('experience_posts')

        .select(`
            id,
            title,
            content,
            post_type,
            category_id,
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

        .eq('id', postId)

        .eq('status', 'approved')

        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;

}

// ========================================
// 7. SUBMIT EXPERIENCE
// ========================================

export async function submitExperience(formData) {

    const user = await getCurrentUser();

    // Guest protection
    if (!user) {

        throw new Error(
            'You must log in to share an experience.'
        );

    }

    // Prepare submission
    const post = {

        author_id: user.id,

        title: normalizeText(
            formData.title
        ),

        content: normalizeText(
            formData.content
        ),

        post_type: normalizeText(
            formData.post_type
        ),

        category_id: normalizeText(
            formData.category_id
        ),

        image_url: normalizeText(
            formData.image_url
        )

    };

    // Validate submission
    validateExperience(post);

    // Insert into Supabase
    const { data, error } = await supabase

        .from('experience_posts')

        .insert(post)

        .select(`
            id,
            title,
            post_type,
            status,
            created_at
        `)

        .single();

    if (error) {
        throw error;
    }

    return data;

}

// ========================================
// 8. GET MY EXPERIENCES
// ========================================

export async function getMyExperiences() {

    const user = await getCurrentUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase

        .from('experience_posts')

        .select(`
            id,
            title,
            content,
            post_type,
            category_id,
            image_url,
            status,
            created_at,
            reviewed_at,
            updated_at,
            volunteer_categories (
                id,
                slug,
                name_en,
                name_id
            )
        `)

        .eq('author_id', user.id)

        .order('created_at', {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return data;

}