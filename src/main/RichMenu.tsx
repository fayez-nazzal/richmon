import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import styles from '../styles.module.css'

interface MenuPropTypes {
  css?: string
  children?: any
  buttonChildren: any
  width?: string
  height?: string
  buttonCss?: string
}

interface StyledMenuProps {
  css: string
}

interface StyledButtonCss {
  css: string
}

const StyledMenu = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 0;
  background-color: white;
  -webkit-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
  -moz-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
  box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
  z-index: 10;
  ${(props: StyledMenuProps) => props.css}
`

const StyledButton = styled.button`
  ${(props: StyledButtonCss) => props.css}
`

export default (props: MenuPropTypes) => {
  const [isShown, setIsShown] = useState(false)
  const selfRef = useRef<any>()

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleClickOutside = (e: MouseEvent) => {
    if (selfRef && !selfRef.current.contains(e.target) && isShown) {
      setIsShown(false)
    }
  }

  const onClick = () => {
    setIsShown(true)
  }

  return (
    <span id='sppp' style={{ position: 'relative' }} ref={selfRef}>
      <StyledButton
        className={styles.button}
        onClick={onClick}
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        css={props.buttonCss ? props.buttonCss : ''}
      >
        {props.buttonChildren}
      </StyledButton>
      <StyledMenu
        css={props.css ? props.css : ''}
        style={{
          width: props.width ? props.width : 'auto',
          height: props.height ? props.height : 'auto',
          visibility: isShown ? 'visible' : 'hidden'
        }}
        onClick={() => {
          setIsShown(false)
        }}
      >
        {props.children}
      </StyledMenu>
    </span>
  )
}
