'use strict';

const path = require('path');

const findAllPosts = require('./find-all-posts.js');

module.exports = generateDataForSsgwp;

let cwd = process.cwd();

// Generate data for static-site-gen-webpack-plugin
function generateDataForSsgwp(options) {
  return findAllPosts(options)
    .then((posts) => {
      return generateDataForSsgwpImpl(posts, options);
    });
}

function generateDataForSsgwpImpl(posts, options) {
  return new Promise((resolve, reject) => {
    if (typeof options.postToRouteMapper !== 'function') {
      return reject('Invalid postToRouteMapper');
    }
    posts = posts
      .map(options.postToRouteMapper);
    if (!Array.isArray(posts) || posts.length < 1) {
      return reject('Must provide some posts');
    }
    for (let postIdx = 0; postIdx < posts.length; ++postIdx) {
      let post = posts[postIdx];
      if (!post.file || !post.header || !post.body) {
        return reject(`Invalid structure for post #${postIdx}`);
      }
      if (!post.file.fullpath ||
        typeof post.file.fullpath !== 'string' ||
        !path.isAbsolute(post.file.fullpath)) {
        return reject(`Invalid slug at post #${postIdx}`);
      }
      if (!post.file.slug || typeof post.file.slug !== 'string') {
        return reject(`Invalid slug at post #${postIdx}`);
      }
      if (!post.header.title || typeof post.header.title !== 'string') {
        return reject(`Invalid title at post #${postIdx}`);
      }
      if (!post.header.__date_utc || typeof post.header.__date_utc !== 'number') {
        return reject(`Invalid __date_utc at post #${postIdx}`);
      }
      if (!Array.isArray(post.header.__tags)) {
        return reject(`Invalid __tags at post #${postIdx}`);
      }
    }

    let routes = posts
      .map((post) => {
        var meta = {
          source: post.file.fullpath.slice(cwd.length + 1),
          slug: post.file.slug,
          title: post.header.title,
          date: post.header.__date_utc,
          tags: post.header.__tags,
          url: post.header.url ||
            (`/${post.file.year}/${post.file.month}/${post.file.day}/${post.file.slug}`),
          urlAliases: [],
        };
        var out = {
          meta: Object.assign(meta, post.meta),
          body: post.body,
        };
        return out;
      })
      .sort((a, b) => {
        return b.meta.date - a.meta.date;
      });
    let urls = [];
    let aliases = {};
    let routses = {}; // Just like how the plural of "mice" is "meeses"
    routes.forEach((route) => {
      urls.push(route.meta.url);
      routses[route.meta.url] = route;
      route.meta.urlAliases.forEach((urlAlias) => {
        if (urlAlias !== route.meta.url &&
            urlAlias !== route.meta.url+'/' &&
            urlAlias+'/' !== route.meta.url) {
          urls.push(urlAlias);
          aliases[urlAlias] = route.meta.url;
        }
      });
    });

    let data = {
      routes: urls,
      props: {
        routes: routses,
        aliases,
      },
    };

    resolve(data);
  });
}
