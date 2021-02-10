export const minPageSize = 1;
export const maxPageSize = 100;
export const defaultPageSize = 10;

// Pagination design influenced by "cursor pagination"
// and "forward/backward pagination" from Relay.
// https://relay.dev/graphql/connections.htm
export const getPaginationParams = (query) => {
  // Forward pagination with first + after
  const firstStr = query["first"];
  const lastStr = query["last"];
  const after = query["after"];
  const before = query["before"];

  const forward = firstStr || after;
  const backward = lastStr || before;
  const noneSpecified = !forward && !backward;

  if (forward && backward) {
    return {
      err:
        "cannot mix and match pagination url params; either use first/after or last/before",
    };
  }

  if (forward || noneSpecified) {
    const limit = sanitizePageSize(parseInt(firstStr));
    return {
      forward: true,
      cursor: after,
      limit,
    };
  } else {
    const limit = sanitizePageSize(parseInt(lastStr));
    return {
      forward: false,
      cursor: before,
      limit,
    };
  }
};

const sanitizePageSize = (size) =>
  isNaN(size) || size < minPageSize || size > maxPageSize
    ? defaultPageSize
    : size;
