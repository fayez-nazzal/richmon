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
  buttonCss?: string
  actionButtonAction?: { (actions: ActionTypes): void }
  actionButtonChildren: (JSX.Element | string)[] | JSX.Element | string
  actionButtonCss?: string
  buttonWrapperCss?: string
  css?: string
}

export default (props: DropDownListProps) => {
  return (
    <React.Fragment>
      <RichMenu
        css={props.css ? props.css : 'padding: 10px;'}
        buttonChildren={<Down style={{ marginBottom: '-2px' }} />}
        actionButtonCss={`
          ${props.actionButtonCss}
          font-weight: normal;
          padding-left: 4px;
          padding-right:2px;
          border-right:none;
          &:hover{
            outline:none;
          }
        `}
        actionButtonAction={props.actionButtonAction}
        actionButtonChildren={props.actionButtonChildren}
        buttonCss={`
        ${props.buttonCss}
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
            position: relative;
            z-index: 1000;
          }
          ${props.buttonWrapperCss}
        `}
        width={props.width}
        height={props.height}
      >
        {props.children}
      </RichMenu>
    </React.Fragment>
  )
}
