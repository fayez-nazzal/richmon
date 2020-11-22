import React, { useState } from 'react'
import { Richmon, Actions } from 'react-richmon'

const App = () => {
  const [content, setContent] = useState('dada')

  return (
    <Richmon
      content={content}
      onChange={setContent}
      tools={[
        'B',
        'I',
        'U',
        'S',
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

export default App
