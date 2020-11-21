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
        padding: 17px 14px;
        ${props.css};
      `}
      width='40px'
    >
      {props.children}
    </RichButton>
  )
}
