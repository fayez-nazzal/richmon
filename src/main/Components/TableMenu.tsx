import React, { useEffect, useState } from 'react'
import Page from './Page'
import RichGrid from './Grid'
import Menu from './RichMenu'
import TableListButton from './TableListButton'
import { ReactComponent as TableIcon } from '../../svgs/table.svg'
import styled from 'styled-components'

interface TableListProps {
  buttonWidth: string
  buttonHeight: string
  buttonCss?: string
  actionButtonCss?: string
  buttonWrapperCss?: string
  css?: string
}

const StyledTableIcon = styled(TableIcon)`
  margin-bottom: -4px;
`

export default (props: TableListProps) => {
  const [buttons, setButtons] = useState<JSX.Element[]>([])

  useEffect(() => {
    const btns: JSX.Element[] = []
    for (let i = 1; i < 6; i++) {
      for (let j = 1; j < 6; j++) {
        btns.push(<TableListButton key={`r${i}c${j}`} row={i} col={j} />)
      }
    }
    setButtons(btns)
  }, [])

  return (
    <React.Fragment>
      <Menu
        css={`
          padding: 0px 8px 14px 6px;
          ${props.css};
        `}
        buttonCss={props.buttonCss}
        buttonWrapperCss={props.buttonWrapperCss}
        actionButtonCss={props.actionButtonCss}
        buttonChildren={<StyledTableIcon />}
        buttonWidth={props.buttonWidth}
        buttonHeight={props.buttonHeight}
      >
        <Page>
          <RichGrid
            shouldUpdate
            rows={5}
            cols={5}
            gridGap='4px'
            cellHeight='16px'
            cellWidth='16px'
            gridAutoFlow='row'
          >
            {[...buttons]}
          </RichGrid>
        </Page>
      </Menu>
    </React.Fragment>
  )
}
