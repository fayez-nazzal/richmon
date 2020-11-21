import React from 'react'
import Seperator from './Seperator'

interface spacerProps {
  width: string
  height: string
  css?: string
}

export default (props: spacerProps) => (
  <Seperator
    thickness={props.width}
    color='transparent'
    height={props.height}
    css={props.css}
  />
)
