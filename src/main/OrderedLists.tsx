import React from 'react'
import Page from './Page'
import { ReactComponent as BulletListIcon } from '../svgs/bulletList.svg'
import styled from 'styled-components'
import DropDownList from './DropDownList'
import ListTemplateButton from './ListTemplateButton'
import RichGrid from './RichGrid'

interface OrderedListsProps {
  buttonWidth: string
  buttonHeight: string
}

const StyledNumberedListIcon = styled(BulletListIcon)`
  width: 12px;
  height: 12px;
  margin-bottom: -4px;
`

export default (props: OrderedListsProps) => {
  return (
    <React.Fragment>
      <DropDownList
        css='padding: 0;'
        leftChildren={<StyledNumberedListIcon />}
        leftAction={(actions) => {
          actions.insertUList('disc')
        }}
        buttonWidth={props.buttonWidth}
        buttonHeight={props.buttonHeight}
        width='125px'
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
