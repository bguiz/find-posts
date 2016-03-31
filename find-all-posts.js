'use strict';

const path = require('path');

const findPosts = require('./find-posts.js');

module.exports = findAllPosts;

function findAllPosts(options) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(options.dirs) || options.dirs.length < 1) {
      return reject('Must specify dirs');
    }

    let promises = [];
    for (let dirIdx = 0; dirIdx < options.dirs.length; ++dirIdx) {
      let dir = options.dirs[dirIdx];
      let fullpath = dir.path;
      let regexes = dir.regexes;
      if (typeof fullpath !== 'string' || !path.isAbsolute(fullpath)) {
        return reject(`Path specified is not valid: ${fullpath}`);
      }
      if (!Array.isArray(regexes) || regexes.length < 1) {
        return reject('Must specify regexes');
      }
      for (let regexIdx = 0; regexIdx < regexes.length; ++regexIdx) {
        let regex = regexes[regexIdx];
        // TODO also verify that regexes are indeed regexes
        promises.push(findPosts(fullpath, regex));
      }
    }

    return Promise
      .all(promises)
      .then((results) => {
        // we have an array of arrays now, and we are going to concatenate them all
        let flattened = results.reduce((prev, curr) => {
          return prev.concat(curr);
        }, []);
        return resolve(flattened);
      })
      .catch(reject);
  });
}
