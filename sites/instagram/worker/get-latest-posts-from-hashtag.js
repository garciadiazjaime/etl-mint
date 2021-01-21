const fs = require('fs');
const jsdom = require('jsdom');
const mapSeries = require('async/mapSeries');
const debug = require('debug')('app:posts-from-hashtag');

const { updateInstagramPost } = require('../../../utils/mint-api');
const { waiter } = require('../../../utils/fetch');
const extract = require('../../../utils/extract');
const config = require('../../../config');

const { JSDOM } = jsdom;

async function getHTML(cookies, hashtag) {
  if (config.get('env') !== 'production') {
    return fs.readFileSync('./stubs/instagram-hashtag.html', 'utf8');
  }

  const source = 'instagram-hashtag';

  return extract(`https://www.instagram.com/explore/tags/${hashtag}/`, source, cookies);
}

function getRecentPosts(html) {
  return new Promise((resolve) => {
    const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

    dom.window.onload = () => {
      resolve(dom.window._sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges);
    };
  });
}

function transform(recentPosts, hashtag) {
  if (!Array.isArray(recentPosts) || !recentPosts.length) {
    return null;
  }

  return recentPosts.map(({ node: post }) => ({
    id: post.id,
    likeCount: post.edge_media_preview_like.count,
    commentsCount: post.edge_media_to_comment.count,
    permalink: `https://www.instagram.com/p/${post.shortcode}/`,
    caption: post.edge_media_to_caption.edges[0].node.text,
    mediaUrl: post.thumbnail_src,
    mediaType: post.__typename,
    source: hashtag,
  }));
}

async function main(cookies) {
  const hashtags = ['tijuanamakesmehungry', 'tijuanafood'];

  const posts = [];

  await mapSeries(hashtags, async (hashtag) => {
    const html = await getHTML(cookies, hashtag);

    const recentPosts = await getRecentPosts(html);

    const data = transform(recentPosts, hashtag);

    posts.push(...data);

    await waiter();
  });

  debug(posts.length);

  await mapSeries(posts, async (post) => {
    await updateInstagramPost(post);
  });
}


if (require.main === module) {
  main().then(() => {
    process.exit(1);
  });
}

module.exports = main;
