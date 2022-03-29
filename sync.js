import _ from "lodash";
import { selectIdFromSlug } from "./utils/common.js";
import {
  deleteLocalFilesFromPost,
  getLocalPublishedBlogs,
  savePost,
} from "./utils/local.js";
import {
  getNotionPublishedBlogPosts,
  pageToPostTransformer,
} from "./utils/notion.js";

const main = async (pageSize = 10, pageToken = undefined) => {
  // fetch all the post from notion
  const remoteResp = await getNotionPublishedBlogPosts(pageSize, pageToken);
  const remotePosts = _.map(remoteResp.results, pageToPostTransformer);
  // console.log("remote posts");
  // console.log(remotePosts);

  // first fetch all the local post
  const localPosts = getLocalPublishedBlogs(remotePosts);
  // console.log("local posts");
  // console.log(localPosts);

  // compare the difference
  // not pulled from remote
  const diffRemote = _.differenceBy(remotePosts, localPosts, selectIdFromSlug);
  console.log("difference from id");
  console.log(diffRemote);

  // update time from remote is different from local
  const diffRemoteByUpdateTime = _.differenceBy(
    remotePosts,
    localPosts,
    (post) => post.date
  );
  console.log("difference from update date");
  console.log(diffRemoteByUpdateTime);

  // persist the difference to local files
  _.map(diffRemote, savePost);

  _.map(diffRemoteByUpdateTime, _.flow(deleteLocalFilesFromPost, savePost));

  // if there's no next cusor, end the process
  if (!remoteResp.next_cursor) return;

  // begin again
  main(pageSize, remoteResp.next_cursor);
};

main();
