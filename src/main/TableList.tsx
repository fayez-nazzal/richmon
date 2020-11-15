import React from 'react'
import Page from './Page'
import RichGrid from './RichGrid'
import List from './List'
import TableListButton from './TableListButton'
import { ReactComponent as TableIcon } from '../svgs/table.svg'
import styled from 'styled-components'

interface TableListProps {
  buttonWidth: string
  buttonHeight: string
}

const StyledTableIcon = styled(TableIcon)`
  margin-bottom: -4px;
`

export default (props: TableListProps) => {
  return (
    <React.Fragment>
      <List
        css='padding: 0px 5px 14px 8px;'
        buttonChildren={<StyledTableIcon />}
        buttonCss=''
        buttonWidth={props.buttonWidth}
        buttonHeight={props.buttonHeight}
      >
        <Page>
          <RichGrid
            rows={5}
            cols={5}
            gridGap='4px'
            cellHeight='16px'
            cellWidth='16px'
            gridAutoFlow='row'
          >
            {[...Array(5)].map((_rvalue: undefined, row: number) =>
              [...Array(5)].map((_cvalue: undefined, col: number) => (
                <TableListButton row={row + 1} col={col + 1} />
              ))
            )}
          </RichGrid>
        </Page>
      </List>
    </React.Fragment>
  )
}
