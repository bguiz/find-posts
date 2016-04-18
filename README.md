# `find-posts`

Finds and parses posts
in specific directories
with specific names.

## Installation

```bash
npm i --save find-posts
```

## Usage

```javascript
const findAllPosts = require('find-posts/find-all-posts.js');

findAllPosts({
  dirs: [
    {
      path: path.resolve(cwd, './posts/foo/'),
      regexes: [ /^(\d\d\d\d)-(\d\d)-(\d\d)-(.*)\.html\.md$/; ],
    },
    {
      path: path.resolve(cwd, './posts/bar/'),
      regexes: [ /^(.+)\.html$/ ],
    }
  ],
})
.then((data) => {
  // look in data for posts
});
```

A post is any file whose name matches the specified pattern,
found within the speicified directory,
and contains front matter that is parseable by
[`front-matter`](https://github.com/jxson/front-matter).

## Author

[Brendan Graetz](http://bguiz.com/)

## Licence

GPL-3.0


