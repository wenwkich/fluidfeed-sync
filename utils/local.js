import { selectIdFromSlug } from "./common.js";
import {
  postToMarkdownTransformer,
  postMarkdownCombiner,
  getNotionSinglePost,
  pageToPostTransformer,
} from "./notion.js";
import { BASE_FLUIDFEED } from "./constants.js";

import fs from "fs";
import path from "path";
import _ from "lodash";
import matter from "gray-matter";
import glob from "glob";

const POST_FOLDERS = path.join(BASE_FLUIDFEED, "data/blog");
const getMatchedFilenames =
  (type = "mdx") =>
  (post) => {
    return glob.sync(selectIdFromSlug(post) + `-*.${type}`, {
      cwd: POST_FOLDERS,
    });
  };

export const getLocalMarkdowns = (otherBlogs) => {
  return _.flatten(_.map(otherBlogs, getMatchedFilenames("mdx"))).map(
    (file) => ({
      ...matter(fs.readFileSync(path.join(POST_FOLDERS, file))).data,
    })
  );
};

export const getLocalBlocks = (otherBlogs) => {
  return _.flatten(_.map(otherBlogs, getMatchedFilenames("json"))).map(
    (file) => {
      return pageToPostTransformer(
        JSON.parse(fs.readFileSync(path.join(POST_FOLDERS, file)))
      );
    }
  );
};

export const savePost = async (post) => {
  const markdown = await postToMarkdownTransformer(post);
  const filename = path.join(POST_FOLDERS, post.slug + ".mdx");
  const content = postMarkdownCombiner(post, markdown);
  fs.writeFileSync(filename, content);
  return post;
};

export const saveBlocks = async (post) => {
  const blocks = await getNotionSinglePost(post.id);
  const filename = path.join(POST_FOLDERS, post.slug + ".json");
  fs.writeFileSync(filename, JSON.stringify(blocks));
  return post;
};

export const deleteLocal = (type) => (post) => {
  const filenames = getMatchedFilenames(type)(post);
  fs.rmSync(path.join(POST_FOLDERS, filenames[0]));
  return post;
};
