import React from 'react'
import './caretStyle.css'

export default (props: { className: string; hidden: boolean }) => {
  return (
    <span className={props.className} hidden={props.hidden}>
      {'\u200b'}
    </span>
  )
}
