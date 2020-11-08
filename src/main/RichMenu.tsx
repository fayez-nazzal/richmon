import React from 'react'
import DropDownList from './DropDownList'

interface MenuPropTypes {
  css?: string
  children?: any
  buttonChildren: any
  width?: string
  height?: string
  buttonCss?: string
}

export default (props: MenuPropTypes) => {
  return (
    <DropDownList
      leftChildren={props.buttonChildren}
      css={`
        display: flex;
        flex-direction: column;
        max-height: 200px;
        overflow-y: auto;
        align-content: center;
        align-items: center;
        ${props.buttonCss}
      `}
      width='auto'
    >
      {props.children}
    </DropDownList>
  )
}
