
// ========================================
// VOLUNTREE - VOLUNTEER SUBMISSION SYSTEM
// File: js/submissions.js
// ========================================

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
// 3. NORMALIZE NUMBER
// ========================================

function normalizeNumber(value) {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ''
    ) {
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        throw new Error('Invalid numeric value.');
    }

    return number;
}

// ========================================
// 4. VALIDATE URL
// ========================================

function validateUrl(value) {
    try {
        const url = new URL(value);

        return (
            url.protocol === 'https:' ||
            url.protocol === 'http:'
        ) && Boolean(url.hostname);

    } catch {
        return false;
    }
}

// ========================================
// 5. VALIDATE SUBMISSION
// ========================================

function validateSubmission(data) {

    // Required information
    const requiredFields = [
        'title',
        'description',
        'organization_name',
        'category_id',
        'location',
        'scope',
        'participation_mode',
        'minimum_age',
        'funding_type',
        'registration_url'
    ];

    for (const field of requiredFields) {
        if (
            data[field] === null ||
            data[field] === undefined ||
            data[field] === ''
        ) {
            throw new Error(
                `${field.replaceAll('_', ' ')} is required.`
            );
        }
    }

    // Scope validation
    const validScopes = ['lokal', 'global'];

    if (!validScopes.includes(data.scope)) {
        throw new Error('Invalid volunteer scope.');
    }

    // Participation mode validation
    const validModes = [
        'online',
        'offline',
        'hybrid'
    ];

    if (!validModes.includes(data.participation_mode)) {
        throw new Error('Invalid participation mode.');
    }

    // Funding type validation
    const validFundingTypes = [
        'free',
        'fully_funded',
        'partially_funded'
    ];

    if (!validFundingTypes.includes(data.funding_type)) {
        throw new Error('Invalid funding type.');
    }

    // Minimum age validation
    if (
        !Number.isInteger(data.minimum_age) ||
        data.minimum_age < 0 ||
        data.minimum_age > 32767
    ) {
        throw new Error('Invalid minimum age.');
    }

    // Maximum age validation
    if (data.maximum_age !== null) {

        if (
            !Number.isInteger(data.maximum_age) ||
            data.maximum_age < data.minimum_age ||
            data.maximum_age > 32767
        ) {
            throw new Error('Invalid maximum age.');
        }
    }

    // Country code validation
    if (data.participation_mode !== 'online') {

        if (
            !data.country_code ||
            !/^[A-Z]{2}$/.test(data.country_code)
        ) {
            throw new Error(
                'A valid country code is required.'
            );
        }
    }

    // Registration URL validation
    if (!validateUrl(data.registration_url)) {
        throw new Error('Invalid registration URL.');
    }

    // Image URL validation
    if (
        data.image_url !== null &&
        !validateUrl(data.image_url)
    ) {
        throw new Error('Invalid image URL.');
    }

    // Date validation
    if (
        data.start_date &&
        data.end_date &&
        data.end_date < data.start_date
    ) {
        throw new Error(
            'End date cannot be earlier than start date.'
        );
    }

    // Funding and cost validation
    if (
        data.funding_type === 'free' ||
        data.funding_type === 'fully_funded'
    ) {
        if (data.cost_amount !== 0) {
            throw new Error(
                'Free and fully funded opportunities must have zero cost.'
            );
        }
    }

    if (
        data.funding_type === 'partially_funded' &&
        data.cost_amount !== null
    ) {
        if (data.cost_amount <= 0) {
            throw new Error(
                'Participation cost must be greater than zero.'
            );
        }

        if (!data.currency_code) {
            throw new Error('Currency code is required.');
        }
    }

    // Currency validation
    if (
        data.currency_code !== null &&
        !/^[A-Z]{3}$/.test(data.currency_code)
    ) {
        throw new Error('Invalid currency code.');
    }

    return true;
}

// ========================================
// 6. SUBMIT VOLUNTEER OPPORTUNITY
// ========================================

export async function submitVolunteer(formData) {

    const user = await getCurrentUser();

    if (!user) {
        throw new Error(
            'Please log in before submitting an opportunity.'
        );
    }

    // Prepare submission data
    const submission = {

        title: normalizeText(formData.title),

        description: normalizeText(formData.description),

        category_id: normalizeText(formData.category_id),

        organization_name: normalizeText(
            formData.organization_name
        ),

        location: normalizeText(formData.location),

        country_code: normalizeText(
            formData.country_code
        )?.toUpperCase() ?? null,

        scope: normalizeText(formData.scope),

        participation_mode: normalizeText(
            formData.participation_mode
        ),

        minimum_age: normalizeNumber(
            formData.minimum_age
        ),

        maximum_age: normalizeNumber(
            formData.maximum_age
        ),

        funding_type: normalizeText(
            formData.funding_type
        ),

        cost_amount: normalizeNumber(
            formData.cost_amount
        ),

        currency_code: normalizeText(
            formData.currency_code
        )?.toUpperCase() ?? null,

        start_date: normalizeText(formData.start_date),

        end_date: normalizeText(formData.end_date),

        registration_deadline: normalizeText(
            formData.registration_deadline
        ),

        registration_url: normalizeText(
            formData.registration_url
        ),

        image_url: normalizeText(formData.image_url),

        source_type: 'user_submission',

        submitted_by: user.id

    };

    // Automatically set zero cost
    if (
        submission.funding_type === 'free' ||
        submission.funding_type === 'fully_funded'
    ) {
        submission.cost_amount = 0;
    }

    // Validate before inserting
    validateSubmission(submission);

    // Insert into Supabase
    const { data, error } = await supabase
        .from('volunteer_opportunities')
        .insert(submission)
        .select(`
            id,
            title,
            status,
            source_type,
            created_at
        `)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

// ========================================
// 7. GET MY SUBMISSIONS
// ========================================

export async function getMySubmissions() {

    const user = await getCurrentUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select(`
            id,
            title,
            description,
            organization_name,
            location,
            scope,
            funding_type,
            status,
            created_at,
            reviewed_at
        `)
        .eq('submitted_by', user.id)
        .order('created_at', {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return data;
}