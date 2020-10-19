import React from 'react'

import { Richmon, RichButton } from 'richmon'
import 'richmon/dist/index.css'

const App = () => {
  return (
    <Richmon
      struct={{
        tools: [
          <RichButton actions={['lighter!']} text='lighter' />,
          <RichButton actions={['bold']} text='hg' />,
          <RichButton actions={['oblique']} text='oblique' />,
          <RichButton actions={['italic']} text='italic' />,
          <RichButton actions={[`table(5, 5)`]} text='normal' />
        ]
      }}
    />
  )
}

export default App
