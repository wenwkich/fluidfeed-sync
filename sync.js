import _ from "lodash";
import { selectIdFromSlug } from "./utils/common.js";
import {
  deleteLocal,
  getLocalBlocks,
  getLocalMarkdowns,
  saveBlocks,
  savePost,
} from "./utils/local.js";
import {
  getNotionPublishedBlogPosts,
  pageToPostTransformer,
} from "./utils/notion.js";

const getDiff = async (getLocal, pageSize, pageToken) => {
  // fetch all the post from notion
  const remoteResp = await getNotionPublishedBlogPosts(pageSize, pageToken);
  const remotePosts = _.map(remoteResp.results, pageToPostTransformer);
  // console.log("remote posts");
  // console.log(remotePosts);

  // first fetch all the local post
  const localPosts = getLocal(remotePosts);
  // console.log("local posts");
  // console.log(localPosts);

  // compare the difference
  // not pulled from remote
  const diffRemote = _.differenceBy(remotePosts, localPosts, selectIdFromSlug);
  console.log("difference from id");
  console.log(diffRemote);

  // update time from remote is different from local
  const diffRemoteByUpdateTime = _.differenceBy(
    localPosts,
    remotePosts,
    (post) => post.date
  ).map((local) => _.find(remotePosts, (post) => post.id === local.id));
  console.log("difference from update date");
  console.log(diffRemoteByUpdateTime);

  return {
    diffRemote,
    diffRemoteByUpdateTime,
    token: remoteResp.next_cursor,
  };
};

// not used anymore
export const syncMarkdown = async (pageSize = 10, pageToken = undefined) => {
  const { diffRemote, diffRemoteByUpdateTime, token } = await getDiff(
    getLocalMarkdowns,
    pageSize,
    pageToken
  );
  // persist the difference to local files
  _.map(diffRemote, savePost);

  _.map(diffRemoteByUpdateTime, _.flow(deleteLocal("md"), savePost));

  // if there's no next cusor, end the process
  if (!token) return;

  // begin again
  syncMarkdown(pageSize, token);
};

export const syncNotionBlocks = async (
  pageSize = 10,
  pageToken = undefined
) => {
  const { diffRemote, diffRemoteByUpdateTime, token } = await getDiff(
    getLocalBlocks,
    pageSize,
    pageToken
  );

  // persist the difference to local files
  _.map(diffRemote, saveBlocks);

  _.map(diffRemoteByUpdateTime, _.flow(deleteLocal("json"), saveBlocks));

  // if there's no next cusor, end the process
  if (!token) return;

  // begin again
  syncNotionBlocks(pageSize, token);
};

import path from "path";
import { fileURLToPath } from "url";
import { fstat } from "fs";

const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url));
const isRunningDirectlyViaCLI = nodePath === modulePath;

if (isRunningDirectlyViaCLI) {
  syncNotionBlocks();
}
