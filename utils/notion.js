import {
  NOTION_INTEGRATION_TOKEN,
  NOTION_BLOG_DATABASE_ID,
} from "./constants.js";

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import _ from "lodash";
import matter from "gray-matter";

const NOTION_CLIENT = new Client({
  auth: NOTION_INTEGRATION_TOKEN,
});
const N2M = new NotionToMarkdown({ notionClient: NOTION_CLIENT });
const DB_ID = NOTION_BLOG_DATABASE_ID ?? "";

export const pageToPostTransformer = (page) => {
  return {
    id: page.id,
    title: page.properties.Title.title[0].plain_text,
    tags: page.properties.Tags.multi_select.map((tag) => tag.name),
    date: page.properties.Updated.last_edited_time,
    slug: page.properties.Slug.formula.string,
  };
};

export const postToMarkdownTransformer = ((n2m) => async (post) => {
  const mdBlocks = await n2m.pageToMarkdown(post.id);
  const markdown = n2m.toMarkdownString(mdBlocks);

  return markdown;
})(N2M);

// this will put the post information into the yaml front matter
export const postMarkdownCombiner = (post, markdown) => {
  return matter.stringify(markdown, post);
};

// filter all published post and sort by last updated date
export const getNotionPublishedBlogPosts = (
  (notionClient, dbId) => async (pageSize, pageToken) => {
    const response = await notionClient.databases.query({
      database_id: dbId,
      filter: {
        property: "Published",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: "Updated",
          direction: "descending",
        },
      ],
      page_size: pageSize,
      start_cursor: pageToken,
    });
    return response;
  }
)(NOTION_CLIENT, DB_ID);

// get single post selected by slug id
export const getNotionSinglePost = ((notionClient, dbId) => async (id) => {
  const response = await notionClient.pages.retrieve({
    page_id: id,
  });
  return response;
})(NOTION_CLIENT, DB_ID);
