import React from 'react'
import { RichButton } from 'react-richmon'

export default (props) => {
  return (
    <RichButton
      action={props.action}
      css={`
        color: ${props.textColor};
        &:hover {
          background-color: #f0ece3;
          outline: 2px solid #f9c49a70;
        }
        ${props.css};
      `}
    >
      {props.children}
    </RichButton>
  )
}
