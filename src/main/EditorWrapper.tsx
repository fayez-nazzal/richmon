import React, { useState } from 'react'
import Caret from './Caret'
import Editor from './Editor'

export default (props: {
  defaultTextColor: string
  defaultHighlightColor: string
  defaultFontSize: string
  editorRef: any
  onChange: { (html: string): void }
  content: string
}) => {
  const [isCaretHidden, setIsCaretHidden] = useState(true)
  const [caretPosition, setCaretPosition] = useState({ left: 0, top: 0 })

  return (
    <React.Fragment>
      <Editor
        html={props.content}
        ref={props.editorRef}
        setEditorHTML={props.onChange}
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
