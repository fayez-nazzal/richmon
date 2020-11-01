import React from 'react'
import './richmonUtils'
import styled from 'styled-components'
import styles from '../styles.module.css'
import { Actions } from './richActions'
import { EditorActions } from './richActions'

interface RichmonButtonProps {
  action: { (actions: Actions): void }
  style?: React.CSSProperties
  css?: string
  colorize?: string
  pageButton?: boolean
  children?: any
}

interface StyledButtonProps {
  colorize?: string
  css: string
}
const StyledButton = styled.button`
  ${(props: StyledButtonProps) =>
    props.colorize
      ? `
padding: 6.4px;
border:none;
width: auto;
height: auto;
background-color: ${props.colorize} !important;
&:hover {
  -webkit-box-shadow: 0px 0px 4px 0px #333333;
  box-shadow: 0px 0px 4px 0px #333333;
  outline: none;
}`
      : ''}

  ${(props: StyledButtonProps) => props.css}
`

export default React.memo((props: RichmonButtonProps) => {
  const onCLick = (e: React.MouseEvent) => {
    props.action(EditorActions)
    e.preventDefault()
  }

  return (
    <StyledButton
      onClick={onCLick}
      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
      onMouseUp={(e: React.MouseEvent) => e.preventDefault()}
      className={`${styles.button} ${props.pageButton ? 'page-button' : ''}`}
      style={props.style}
      css={props.css ? props.css : ''}
      colorize={props.colorize}
    >
      {props.children}
    </StyledButton>
  )
})
