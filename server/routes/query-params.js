export const minPageSize = 1;
export const maxPageSize = 100;
export const defaultPageSize = 10;

// Pagination design influenced by "cursor pagination"
// and "forward/backward pagination" from Relay.
// https://relay.dev/graphql/connections.htm
export const getPaginationParams = (query) => {
  // Forward pagination with first + after
  let first = getUrlParamAsNumber(query, "first");
  const after = query["after"] || "";

  // Backward pagination with last + before
  let last = getUrlParamAsNumber(query, "last");
  const before = query["before"] || "";

  // Default to forward pagination.
  if (Number.isInteger(first) || isNaN(last)) {
    const limit = sanitizePageSize(first);
    return {
      foward: true,
      cursor: after,
      limit,
    };
  } else {
    const limit = sanitizePageSize(last);
    return {
      foward: false,
      cursor: before,
      limit,
    };
  }
};

const sanitizePageSize = (size) =>
  size < minPageSize || size > maxPageSize ? defaultPageSize : size;

const getUrlParamAsNumber = (query, name) => {
  const valStr = query[name];
  return parseInt(valStr);
};
