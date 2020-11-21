import React from 'react'
import { RichButton } from './ButtonComponents'

interface SeperatorProps {
  color: string
  thickness: string
  height?: string
}

export default (props: SeperatorProps) => (
  <RichButton
    action={(_actions) => {}}
    width={props.thickness}
    height={props.height ? props.height : 'auto'}
    css={`
      background-color: ${props.color} !important;
      outline: none !important;
      padding: 0 !important;
      white-space: pre;
      margin: 0 2.4px;
    `}
  >
    {' '}
  </RichButton>
)
