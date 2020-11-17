import React from 'react'
import RichButton from './RichButton'

interface SeperatorProps {
  color: string
  thickness: string
  height?: string
}

export default (props: SeperatorProps) => (
  <RichButton
    action={(_actions) => {}}
    css={`
      background-color: ${props.color} !important;
      outline: none !important;
      padding: 0 !important;
      white-space: pre;
      margin: 0 2.4px;
    `}
    width={props.thickness}
    height={props.height ? props.height : 'auto'}
  >
    {' '}
  </RichButton>
)
