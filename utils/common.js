import _ from "lodash";

// normalize the data with
export const normalize = (selector) => (collection) =>
  _.reduce(
    collection,
    (prev, curr) => ({
      ...prev,
      [selector(curr)]: curr,
    }),
    {}
  );

export const getIdFromSlug = (slug) => slug.split("-")[0];

export const selectIdFromSlug = (post) => getIdFromSlug(post.slug);
