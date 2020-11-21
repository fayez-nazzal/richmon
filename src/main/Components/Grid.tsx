import React from 'react'
import '../../richmonUtils'
import styled, { css } from 'styled-components'
import isEqual from 'lodash.isequal'

interface GridProps {
  rows: number
  cols: number
  gridGap?: string
  gridAutoFlow?: string
  cellWidth?: string
  cellHeight?: string
  css?: string
  shouldUpdate?: boolean
  children?: any
}

interface StyledGridProps {
  cols: number
  rows: number
  gridGap: string
  gridAutoFlow: string
  cellWidth: string
  cellHeight: string
  css: string
}
const StyledGrid = styled.div`
  ${(props: StyledGridProps) => css`
    display: grid;
    grid-auto-flow: ${props.gridAutoFlow};
    grid-gap: ${props.gridGap};
    grid-template-rows: repeat(${props.rows}, ${props.cellHeight});
    grid-template-columns: repeat(${props.cols}, ${props.cellWidth});
    ${props.css};
  `}
`

export default React.memo((props: GridProps) => {
  return (
    <StyledGrid
      rows={props.rows}
      cols={props.cols}
      gridAutoFlow={props.gridAutoFlow ? props.gridAutoFlow : 'column'}
      gridGap={props.gridGap ? props.gridGap : '6px'}
      cellWidth={props.cellWidth ? props.cellWidth : '1fr'}
      cellHeight={props.cellHeight ? props.cellHeight : '1fr'}
      css={props.css ? props.css : ''}
    >
      {props.children}
    </StyledGrid>
  )
}, shouldNotUpdate)

function shouldNotUpdate(prevProps: GridProps, nextProps: GridProps) {
  return !nextProps.shouldUpdate || isEqual(prevProps, nextProps)
}
