import React from 'react'

import { Richmon, RichButton } from 'richmon'
import 'richmon/dist/index.css'

const App = () => {
  return (
    <Richmon
      struct={{
        tools: [
          <RichButton
            actions={['highlightText(red)', 'bold', () => console.log('hello')]}
            text='custom'
          />,
          'bold'
        ]
      }}
    />
  )
}

export default App
