export const getPagination = (query) => {
    const page = query.page
        ? Number(query.page)
        : 1;
    const limit = query.limit
        ? Number(query.limit)
        : 10;
    if (!Number.isInteger(page) ||
        !Number.isInteger(limit) ||
        page < 1 ||
        limit < 1 ||
        limit > 100) {
        return null;
    }
    const skip = (page - 1) * limit;
    return {
        page,
        limit,
        skip
    };
};
