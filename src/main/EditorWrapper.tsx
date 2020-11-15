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
  width: string
  height: string
  padding: string
  caretDelay: string
  css: string
}) => {
  const [isCaretHidden, setIsCaretHidden] = useState(true)
  const [caretPosition, setCaretPosition] = useState({ left: 0, top: 0 })
  const [caretHeight, setCaretHeight] = useState('1em')
  const [caretDelay, setCaretDelay] = useState(props.caretDelay)

  const resetCaretDelay = () => {
    setCaretDelay(props.caretDelay)
  }

  return (
    <React.Fragment>
      <Editor
        css={props.css}
        width={props.width}
        height={props.height}
        padding={props.padding}
        html={props.content}
        ref={props.editorRef}
        setEditorHTML={props.onChange}
        caretPos={caretPosition}
        caretDelay={caretDelay}
        setCaretPos={setCaretPosition}
        isCaretHidden={isCaretHidden}
        setIsCaretHidden={setIsCaretHidden}
        defaultTextColor={props.defaultTextColor}
        defaultHgColor={props.defaultHighlightColor}
        defaultFontSize={props.defaultFontSize}
        caretHeight={caretHeight}
        setCaretHeight={setCaretHeight}
        setCaretDelay={setCaretDelay}
        resetCaretDelay={resetCaretDelay}
      />
      <Caret
        transitionDelay={caretDelay}
        height={caretHeight}
        hidden={isCaretHidden}
        left={caretPosition.left}
        top={caretPosition.top}
      />
    </React.Fragment>
  )
}
