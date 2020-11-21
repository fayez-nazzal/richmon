import React, { CSSProperties } from 'react'
import { Actions } from '../../Actions'
import RichButton from './RichButton'

interface OptionProps {
  action: { (actions: Actions): void }
  children?: any
  style?: CSSProperties
  css?: string
}

const RichOption = (props: OptionProps) => {
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

export default RichOption
