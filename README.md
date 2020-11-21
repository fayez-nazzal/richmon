# richmon

> Richmon is a new rich text editor for React that is very easy to use and customize, it's currently on the alpha release and - new features are listed to be added in future releases.

[![NPM](https://img.shields.io/npm/v/richmon.svg)](https://www.npmjs.com/package/richmon) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save richmon
```

## Getting started

```js
import React, { useState } from 'react'

import { Richmon } from 'richmon'

export default () => {
  const [content, setContent] = useState('<div></div>')

  return (
    <Richmon
      content={content}
      onChange={setContent}
      tools={[
        'BIUS',
        'thin-seperator',
        'sub',
        'sup',
        'thin-seperator',
        'fontSize',
        'textColor',
        'textHighlight',
        'textShadow',
        'thin-seperator',
        'orderedList',
        'unOrderedList',
        'table'
      ]}
    />
  )
}
```

If you don't want a smooth caret, just include the `disableSmoothCaret` prop.

## License

MIT © [fayez-nazzal](https://github.com/fayez-nazzal)

<div>List icons made by <a href="https://www.flaticon.com/authors/dave-gandy" title="Dave Gandy">Dave Gandy</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
