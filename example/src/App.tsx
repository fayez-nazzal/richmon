import React, { useEffect, useState } from 'react'

import { Richmon } from 'richmon'
import 'richmon/dist/index.css'

const App = () => {
  const [content, setContent] = useState('<div></div>')

  useEffect(() => {
    console.log(content)
  })
  return (
    <Richmon
      config={{ height: '400px' }}
      top={['BIU', 'textColor', 'textHighlight', 'textShadow']}
      content={content}
      onChange={setContent}
    />
  )
}

export default App
