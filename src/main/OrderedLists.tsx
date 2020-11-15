import React from 'react'
import Page from './Page'
import Flex from './Flex'
import { ReactComponent as BulletListIcon } from '../svgs/bulletList.svg'
import styled from 'styled-components'
import DropDownList from './DropDownList'
import ListTemplateButton from './ListTemplateButton'

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
        width='113px'
      >
        <Page>
          <Flex>
            <ListTemplateButton listType='ol' listStyleType='lower-alpha' />
          </Flex>
        </Page>
      </DropDownList>
    </React.Fragment>
  )
}
