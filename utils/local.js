import { normalize, selectIdFromSlug } from "./common.js";
import { postToMarkdownTransformer, postMarkdownCombiner } from "./notion.js";
import { BASE_FLUIDFEED } from "./constants.js";

import fs from "fs";
import path from "path";
import _ from "lodash";
import matter from "gray-matter";
import glob from "glob";

const POST_FOLDERS = path.join(BASE_FLUIDFEED, "data/_posts");
const getMatchedFilenames = (post) => {
  return glob.sync(selectIdFromSlug(post) + "-*.md", { cwd: POST_FOLDERS });
};

export const getLocalPublishedBlogs = (otherBlogs) => {
  return _.flatten(_.map(otherBlogs, getMatchedFilenames)).map((file) => ({
    ...matter(fs.readFileSync(path.join(POST_FOLDERS, file))).data,
  }));
};

export const savePost = async (post) => {
  const markdown = await postToMarkdownTransformer(post);
  const filename = path.join(POST_FOLDERS, post.slug + ".md");
  const content = postMarkdownCombiner(post, markdown);
  fs.writeFileSync(filename, content);
  return post;
};

export const deleteLocalFilesFromPost = (post) => {
  const filenames = getMatchedFilenames(post);
  fs.rmSync(path.join(POST_FOLDERS, filenames[0]));
  return post;
};
