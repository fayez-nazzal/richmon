import React from 'react'
import styled from 'styled-components'

export interface PageProps {
  parent?: any
  children?: any
  css?: string
  display?: boolean
  className?: string
}

const Div = styled.div`
  padding: 0;
  ${(props: { css: string }) => props.css};
`

export default (props: PageProps) => {
  return (
    <Div
      className='page'
      css={props.css ? props.css : ''}
      style={{
        display: props.display ? 'block' : 'none'
      }}
    >
      {props.children}
    </Div>
  )
}
