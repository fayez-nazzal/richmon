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
  buttonCss?: string
  actionButtonCss?: string
  buttonWrapperCss?: string
}

const StyledNumberedListIcon = styled(BulletListIcon)`
  margin-bottom: -4px;
`

export default (props: OrderedListsProps) => {
  return (
    <React.Fragment>
      <DropDownList
        css='padding: 0;'
        actionButtonChildren={<StyledNumberedListIcon />}
        actionButtonAction={(actions) => {
          actions.insertUList('disc')
        }}
        buttonWidth={props.buttonWidth}
        buttonHeight={props.buttonHeight}
        width='105px'
        buttonCss={props.buttonCss}
        actionButtonCss={props.actionButtonCss}
        buttonWrapperCss={props.buttonWrapperCss}
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
