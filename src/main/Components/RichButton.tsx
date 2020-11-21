import React from 'react'
import '../../richmonUtils'
import styled, { css } from 'styled-components'
import { ActionTypes } from '../../Actions'
import { Actions } from '../../Actions'
import StyledButtonCss from './styledButtonCss'

interface RichmonButtonProps {
  action: { (actions: ActionTypes): void }
  style?: React.CSSProperties
  css?: string
  colorize?: string
  pageButton?: boolean
  children?: any
  width?: string
  height?: string
}

interface StyledButtonProps {
  colorize?: string
  css: string
  width?: string
  height?: string
}
const StyledButton = styled.button`
  ${(props: StyledButtonProps) =>
    props.colorize
      ? `
        padding: 6.4px;
        border:none;
        width: auto;
        height: auto;
        background-color: ${
          props.colorize ? props.colorize : 'transparent'
        } !important;
        margin: 0;
        &:hover {
          -webkit-box-shadow: 0px 0px 4px 0px #333333;
          box-shadow: 0px 0px 4px 0px #333333;
          outline: none;
        }
        font-weight: bold;
        margin-bottom: 1px;
      `
      : `
        ${StyledButtonCss}
      `}

  ${(props: StyledButtonProps) => css`
    width: ${props.width ? props.width : 'auto'};
    height: ${props.height ? props.height : '97%'};
    ${props.css};
  `}
`

const RichButton = React.memo((props: RichmonButtonProps) => {
  const onCLick = (_e: React.MouseEvent) => {
    props.action(Actions)
    _e.preventDefault()
  }

  return (
    <StyledButton
      width={props.width}
      height={props.height}
      onClick={onCLick}
      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
      onMouseUp={(e: React.MouseEvent) => e.preventDefault()}
      className={`${props.pageButton ? 'page-button' : ''}`}
      style={props.style}
      css={props.css ? props.css : ''}
      colorize={props.colorize}
    >
      {props.children}
    </StyledButton>
  )
})

export default RichButton
