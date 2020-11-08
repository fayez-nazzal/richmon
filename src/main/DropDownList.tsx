import React from 'react'
import List from './List'
import { ReactComponent as Down } from '../svgs/down.svg'
import { Actions } from './richActions'

interface DropDownListProps {
  leftAction?: { (actions: Actions): void }
  leftChildren: (JSX.Element | string)[] | JSX.Element | string
  children?: any
  css?: string
  width?: string
}

export default (props: DropDownListProps) => {
  return (
    <React.Fragment>
      <List
        css={props.css ? props.css : 'padding: 10px;'}
        buttonChildren={<Down style={{ marginBottom: '-2px' }} />}
        leftButtonCss='font-weight: normal;padding-left: 4px;padding-right:2px;border-right:none;width: 24px;height:28px;&:hover{outline:none;}'
        leftButtonAction={props.leftAction}
        leftButtonChildren={props.leftChildren}
        buttonCss={`
          padding: 0 3px;
          border-left: none;
          width: auto;
          height: 28px;
          &:hover {
            outline: none;
          }
        `}
        buttonWrapperCss={`
          &:hover {
            outline: 2px solid #e3e3e3;
            z-index: 1000;
            position: relative;
          }
        `}
        width={props.width ? props.width : '135px'}
      >
        {props.children}
      </List>
    </React.Fragment>
  )
}
