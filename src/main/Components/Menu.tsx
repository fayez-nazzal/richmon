import React from 'react'
import DropDownList from './ArrowRichMenu'

interface MenuPropTypes {
  children?: any
  buttonChildren: any
  width?: string
  height?: string
  buttonWidth: string
  buttonHeight: string
  buttonCss?: string
  css?: string
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
        align-items: stretch;
        ${props.css};
      `}
      width='auto'
      buttonWidth={props.buttonWidth}
      buttonHeight={props.buttonHeight}
    >
      {props.children}
    </DropDownList>
  )
}
