import React, { useState } from 'react'
import { Richmon } from 'richmon'
import 'richmon/dist/index.css'

const App = () => {
  const [content, setContent] = useState('<div></div>')
  return (
    <Richmon
      content={content}
      onChange={setContent}
      tools={[
        'BIUS',
        'sub',
        'sup',
        'textColor',
        'textHighlight',
        'textShadow',
        'table',
        'orderedList',
        'unorderedList'
      ]}
      width='100wh'
      height='100vh'
    />
  )
}

export default App
