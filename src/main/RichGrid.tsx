import React, { useState } from 'react'
import './richmonUtils'
import styled from 'styled-components'
import isEqual from 'lodash.isequal'

interface GridProps {
  rows: number
  cols: number
  css?: string
  shouldUpdate?: boolean
  children?: any
}

export default React.memo((props: GridProps) => {
  const [Grid] = useState<any>(styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-gap: 6px;
    ${props.css}
  `)

  return (
    <Grid
      style={{
        gridTemplateRows: `repeat(${props.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${props.cols}, 1fr)`
      }}
    >
      {props.children}
    </Grid>
  )
}, shouldNotUpdate)

function shouldNotUpdate(prevProps: GridProps, nextProps: GridProps) {
  return !nextProps.shouldUpdate || isEqual(prevProps, nextProps)
}
