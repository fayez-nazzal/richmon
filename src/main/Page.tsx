import React, { useState } from 'react'
import styled from 'styled-components'

export interface PageProps {
  parent?: any
  children?: any
  css?: string
  display?: boolean
  className?: string
}

export default (props: PageProps) => {
  const [Div] = useState<any>(styled.div`
    padding: 0;
    ${props.css};
  `)

  return (
    <Div
      className='page'
      style={{
        display: props.display ? 'block' : 'none'
      }}
    >
      {props.children}
    </Div>
  )
}
