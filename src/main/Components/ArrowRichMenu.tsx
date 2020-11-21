import React from 'react'
import RichMenu from './RichMenu'
import { ReactComponent as Down } from '../../svgs/down.svg'
import { ActionTypes } from '../../Actions'

interface DropDownListProps {
  children?: any
  width?: string
  height?: string
  buttonHeight: string
  buttonWidth: string
  leftAction?: { (actions: ActionTypes): void }
  leftChildren: (JSX.Element | string)[] | JSX.Element | string
  css?: string
}

export default (props: DropDownListProps) => {
  return (
    <React.Fragment>
      <RichMenu
        css={props.css ? props.css : 'padding: 10px;'}
        buttonChildren={<Down style={{ marginBottom: '-2px' }} />}
        leftButtonCss={`font-weight: normal;padding-left: 4px;padding-right:2px;border-right:none;&:hover{outline:none;}`}
        leftButtonAction={props.leftAction}
        leftButtonChildren={props.leftChildren}
        buttonCss={`
          padding: 0 3px;
          border-left: none;
          &:hover {
            outline: none;
          }
        `}
        buttonWidth={props.buttonWidth}
        buttonHeight={props.buttonHeight}
        buttonWrapperCss={`
          &:hover {
            outline: 2px solid #e3e3e3;
            z-index: 1000;
            position: relative;
          }
        `}
        width={props.width}
        height={props.height}
      >
        {props.children}
      </RichMenu>
    </React.Fragment>
  )
}
