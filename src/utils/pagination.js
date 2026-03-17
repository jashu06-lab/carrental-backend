export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 25));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset, limit: pageSize };
}

export function buildResponsePage(data, count, page, pageSize) {
  const totalPages = Math.ceil(count / pageSize);
  return {
    data,
    meta: {
      page,
      pageSize,
      total: count,
      totalPages,
    },
  };
}
