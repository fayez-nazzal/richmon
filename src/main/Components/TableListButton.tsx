import React, { useCallback, useEffect, useRef, useState } from 'react'
import RichButton from './RichButton'

interface TableListButtonProps {
  row: number
  col: number
}

export default React.memo((props: TableListButtonProps) => {
  const [selected, setSelected] = useState(false)
  const right = useRef()
  const bottom = useRef()

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      const clientRect = node.getBoundingClientRect()
      right.current = clientRect.left
      bottom.current = clientRect.top
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  const onMouseMove = (e: MouseEvent) => {
    setSelected(e.clientX > right.current! && e.clientY > bottom.current!)
  }

  return (
    <React.Fragment>
      <span ref={measuredRef}>
        <RichButton
          action={(actions) => {
            actions.insertTable(props.row, props.col)
          }}
          css={`
            background-color: unset !important;
            border: 1.6px solid ${selected ? '#0096c7' : '#90e0ef'};
            &:hover {
              outline: none;
            }
            padding: 8px;
          `}
        />
      </span>
    </React.Fragment>
  )
})
