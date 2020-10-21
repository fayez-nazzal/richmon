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
          <RichButton
            actions={['img(https://dummyimage.com/700x700/0000ff/fff)']}
            text='blue image'
          />,
          <RichButton
            actions={['img(https://dummyimage.com/200x200/f23/fff)']}
            text='red image'
          />,
          <RichButton
            actions={['img(https://dummyimage.com/90x80/000/fff)']}
            text='black image'
          />,
          <RichButton actions={[`delete`]} text='delete' />,
          <RichButton actions={[`table(4, 4)`]} text='normal' />
        ]
      }}
    />
  )
}

export default App
