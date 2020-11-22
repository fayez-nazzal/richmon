import React from 'react'
import ArrowRichMenu from './ArrowRichMenu'

interface MenuPropTypes {
  children?: any
  buttonChildren: any
  width?: string
  height?: string
  buttonWidth: string
  buttonHeight: string
  buttonCss?: string
  actionButtonCss?: string
  buttonWrapperCss?: string
  css?: string
}

export default (props: MenuPropTypes) => {
  return (
    <ArrowRichMenu
      actionButtonChildren={props.buttonChildren}
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
      buttonCss={props.buttonCss}
      actionButtonCss={props.actionButtonCss}
    >
      {props.children}
    </ArrowRichMenu>
  )
}
