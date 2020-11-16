import React, { useState } from 'react'
import { Richmon } from 'richmon'

const App = () => {
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
        'table',
        'orderedList',
        'unorderedList'
      ]}
      css='box-shadow: none !important;-webkit-box-shadow: none !important;'
      width='100wh'
      height='100vh'
    />
  )
}

export default App
