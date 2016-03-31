'use strict';

const fs = require('fs');

const moment = require('moment');
const frontMatter = require('front-matter');

module.exports = annotatePost;

function annotatePost(post) {
  return new Promise((resolve, reject) => {
    fs.readFile(post.fullpath, 'utf8', (err, data) => {
      if (!!err) {
        return reject(err);
      }
      let content = frontMatterExtra(data);
      return resolve({
        file: post,
        header: content.attributes,
        body: content.body,
      });
    })
  });
}

function frontMatterExtra(data) {
  let content = frontMatter(data);

  // parse date into something useable
  try {
    content.attributes.__date_utc =
      moment.utc(content.attributes.date).valueOf();
  }
  catch (ex) {
    console.error(`Unable to parse ${content.attributes.date} as a date`);
    content.attributes.__date_utc = null;
  }

  // parse tags
  if (typeof content.attributes.tags === 'string') {
    content.attributes.__tags = content.attributes.tags
      .split(',')
      .map((tag) => {
        return tag.trim();
      });
  }

  return content;
}
