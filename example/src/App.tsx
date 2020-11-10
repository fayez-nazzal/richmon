import React, { useEffect, useState } from 'react'

import { Richmon } from 'richmon'
import 'richmon/dist/index.css'

const App = () => {
  const [content, setContent] = useState('<div></div>')

  useEffect(() => {
    console.log(content)
  })

  const download = (filename: string, content: string) => {
    var pom = document.createElement('a')
    pom.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    )
    pom.setAttribute('download', filename)
    pom.click()
  }

  return (
    <React.Fragment>
      <button
        onClick={() => {
          const fname = prompt('enter file name')
          download(fname!, content)
        }}
      >
        download
      </button>
      <Richmon
        height='400px'
        top={['BIU', 'fontSize', 'textColor', 'textHighlight', 'textShadow']}
        content={content}
        onChange={setContent}
      />
    </React.Fragment>
  )
}

export default App
