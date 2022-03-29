# fluidfeed-sync
This repo attempts to sync the post from Notion (notion.so) to any blog repository using static site generator 

## What does it do?
It will sync your remote notion pages from a database into your local static site generator repo (when you add a new page and when you update your post, it doesn't delete your post when you delete your page on Notion)

Note that you might need to `git push` your repo with new commits for your site to see new contents

## Motion
If you doesn't cache your pages (I simply just write to the github repo and let vercel/netlify re-render the whole site), client's request to Notion API might hit a rate limit

## Setup
1. Get your notion integration token by with this [guide](https://www.notion.so/help/create-integrations-with-the-notion-api)
2. Create a database like this (You can also copy this site as your template): https://wendywki.notion.site/e17d56ae9ee045a9bf07c57e39f29d3b?v=69d73ac0982e4b69a0eef4fe615f6b54
3. get your database id with `share`, for example, from my database link, my database id is `e17d56ae9ee045a9bf07c57e39f29d3b`
4. Then create a `.env` file in the repo, copy the token, database and your base project path like this (assume your `.md` files will be in the :

```
NOTION_BLOG_DATABASE_ID=e17d56ae9ee045a9bf07c57e39f29d3b
NOTION_INTEGRATION_TOKEN=${YOUR_INTEGRATION_TOKEN}
BASE_FLUIDFEED=../fluidfeed
```

## Run
```
node sync.js
```

## Warning
I cannot assure the script will work when there's more than 10 published pages in a database (I only tested 1 page) but we'll get there

Also I'm not sure this script has catered the media files such as images and videos
