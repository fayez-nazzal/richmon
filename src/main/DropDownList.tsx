import React from 'react'
import List from './List'
import { ReactComponent as Down } from '../svgs/down.svg'
import { Actions } from './EditorActions'

interface DropDownListProps {
  leftAction?: { (actions: Actions): void }
  leftChildren: (JSX.Element | string)[] | JSX.Element | string
  children?: any
  css?: string
  height?: string
  width?: string
  buttonHeight: string
  buttonWidth: string
}

export default (props: DropDownListProps) => {
  return (
    <React.Fragment>
      <List
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
      </List>
    </React.Fragment>
  )
}
