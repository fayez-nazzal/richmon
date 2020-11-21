import React from 'react'
import Page from './Page'
import Flex from './Flex'
import { ReactComponent as BulletListIcon } from '../../svgs/bulletList.svg'
import styled from 'styled-components'
import DropDownList from './ArrowRichMenu'
import ListTemplateButton from './ListTemplateButton'

interface OrderedListsProps {
  buttonWidth: string
  buttonHeight: string
}

const StyledNumberedListIcon = styled(BulletListIcon)`
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
        width='105px'
      >
        <Page>
          <Flex>
            <ListTemplateButton listType='ul' listStyleType='square' />
            <ListTemplateButton listType='ul' listStyleType='circle' />
          </Flex>
        </Page>
      </DropDownList>
    </React.Fragment>
  )
}
