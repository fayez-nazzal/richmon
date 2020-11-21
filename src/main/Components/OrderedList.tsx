import React from 'react'
import Page from './Page'
import { ReactComponent as NumberedListIcon } from '../../svgs/numberedList.svg'
import styled from 'styled-components'
import DropDownList from './ArrowRichMenu'
import ListTemplateButton from './ListTemplateButton'
import RichGrid from './Grid'

interface OrderedListsProps {
  buttonWidth: string
  buttonHeight: string
}

const StyledNumberedListIcon = styled(NumberedListIcon)`
  margin-bottom: -4px;
`

export default (props: OrderedListsProps) => {
  return (
    <React.Fragment>
      <DropDownList
        css='padding: 0;'
        leftChildren={<StyledNumberedListIcon />}
        leftAction={(actions) => {
          actions.insertOList()
        }}
        buttonWidth={props.buttonWidth}
        buttonHeight={props.buttonHeight}
        width='120px'
      >
        <Page>
          <RichGrid rows={2} cols={2}>
            <ListTemplateButton listType='ol' listStyleType='lower-alpha' />
            <ListTemplateButton listType='ol' listStyleType='upper-alpha' />
            <ListTemplateButton listType='ol' listStyleType='lower-roman' />
            <ListTemplateButton listType='ol' listStyleType='upper-roman' />
          </RichGrid>
        </Page>
      </DropDownList>
    </React.Fragment>
  )
}
