// Default filter
export const DEFAULT_FILTERS = {
    scope: 'all',
    categories: [],
    age: 'all',
    funding: []
};

// Filter berdasarkan cakupan
export function filterByScope(volunteers, scope) {
    if (!scope || scope === 'all') {
        return volunteers;
    }

    return volunteers.filter(volunteer =>
        volunteer.scope === scope
    );
}

// Filter berdasarkan kategori
export function filterByCategory(volunteers, categories) {
    if (!categories || categories.length === 0) {
        return volunteers;
    }

    return volunteers.filter(volunteer =>
        categories.includes(volunteer.category_id)
    );
}

// Filter berdasarkan usia
export function filterByAge(volunteers, age) {
    if (!age || age === 'all') {
        return volunteers;
    }

    return volunteers.filter(volunteer => {
        const min = volunteer.minimum_age;
        const max = volunteer.maximum_age;

        if (age === 'teen') {
            return min != null &&
                min <= 17 &&
                (max == null || max >= 13);
        }

        if (age === 'adult') {
            return min != null && min >= 18;
        }

        return true;
    });
}

// Filter berdasarkan pendanaan
export function filterByFunding(volunteers, funding) {
    if (!funding || funding.length === 0) {
        return volunteers;
    }

    return volunteers.filter(volunteer =>
        funding.includes(volunteer.funding_type)
    );
}

// Menggabungkan seluruh filter
export function applyFilters(volunteers, filters = {}) {
    const activeFilters = {
        ...DEFAULT_FILTERS,
        ...filters
    };

    let results = [...volunteers];

    results = filterByScope(
        results,
        activeFilters.scope
    );

    results = filterByCategory(
        results,
        activeFilters.categories
    );

    results = filterByAge(
        results,
        activeFilters.age
    );

    results = filterByFunding(
        results,
        activeFilters.funding
    );

    return results;
}