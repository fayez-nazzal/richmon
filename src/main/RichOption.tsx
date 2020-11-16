import React, { CSSProperties } from 'react'
import RichButton from './RichButton'
import { Actions } from './EditorActions'

interface RichOptionProps {
  action: { (actions: Actions): void }
  css?: string
  children?: any
  style?: CSSProperties
}

export default (props: RichOptionProps) => {
  return (
    <RichButton
      action={props.action}
      css={`
        flex: 1 1 auto;
        outline: none !important;
        ${props.css}
      `}
      style={props.style}
      width='auto'
      height='auto'
    >
      {props.children}
    </RichButton>
  )
}
