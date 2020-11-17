import React from 'react'
import Seperator from './Seperator'

interface spacerProps {
  width: string
  height: string
}

export default (props: spacerProps) => (
  <Seperator
    thickness={props.width}
    color='transparent'
    height={props.height}
  />
)
