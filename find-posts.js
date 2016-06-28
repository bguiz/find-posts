'use strict';

const path = require('path');

const walkdir = require('walkdir');

const annotatePost = require('./annotate-post.js');

module.exports = findPosts;

function findPosts(dir, matchPostRegex) {
  return new Promise((resolve, reject) => {
    let results = [];
    let finder = walkdir(dir);

    finder.on('file', (fullpath, stat) => {
      let basename = path.basename(fullpath);
      let matches = basename.match(matchPostRegex);
      if (matches && matches.length > 1) {
        let info = {
          fullpath,
          basename,
          matches,
        };
        results.push(annotatePost(info));
      }
    });

    finder.on('error', (path, err) => {
      console.error(`walkdir error on ${path}`);
      return reject(err);
    });

    finder.on('fail', (path, err) => {
      console.error(`walkdir fail on ${path}`);
      return reject(err);
    });

    finder.on('end', () => {
      if (results.length > 0) {
        return Promise
          .all(results)
          .then(resolve)
          .catch(reject);
      }
      else {
        return reject(`No posts found in ${dir} using ${matchPostRegex}`);
      }
    });
  });
}
