import React from 'react'

import { Richmon, RichButton } from 'richmon'
import 'richmon/dist/index.css'

const App = () => {
  return (
    <Richmon
      struct={{
        tools: [
          <RichButton
            actions={[
              'css(color: red;font-weight: bolder;)',
              () => console.log('hello')
            ]}
            text='css'
          />,
          <RichButton
            actions={['highlightText(red)', () => console.log('hello')]}
            text='hg'
          />
        ]
      }}
    />
  )
}

export default App
