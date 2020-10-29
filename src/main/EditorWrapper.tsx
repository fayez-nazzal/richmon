import React, { useState } from 'react'
import Caret from './Caret'
import Editor from './Editor'

export default (props: {
  defaultTextColor: string
  defaultHighlightColor: string
  defaultFontSize: string
  editorRef: any
}) => {
  const [isCaretHidden, setIsCaretHidden] = useState(true)
  const [caretPosition, setCaretPosition] = useState({ left: 0, top: 0 })
  const [html, setHTML] = useState('<div></div>')

  const setEditorHTML = (html: string) => {
    setHTML(html)
  }

  return (
    <React.Fragment>
      <Editor
        html={html}
        ref={props.editorRef}
        setEditorHTML={setEditorHTML}
        setCaretPos={setCaretPosition}
        setIsCaretHidden={setIsCaretHidden}
        defaultTextColor={props.defaultTextColor}
        defaultHgColor={props.defaultHighlightColor}
        defaultFontSize={props.defaultFontSize}
      />
      <Caret
        hidden={isCaretHidden}
        left={caretPosition.left}
        top={caretPosition.top}
      />
    </React.Fragment>
  )
}
