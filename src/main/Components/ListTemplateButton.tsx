import React from 'react'
import styled from 'styled-components'
import RichButton from './RichButton'
import { orderedListTypes, unOrderedListTypes } from '../../Actions'

type ListType = 'ol' | 'ul'

interface StyledListProps {
  listStyleType: string
}

const StyledOl = styled.ol`
  padding: 0;
  margin: 0;
  list-style-position: inside;
  list-style-type: ${(props: StyledListProps) => props.listStyleType};
`

const StyledUl = styled.ul`
  padding: 0;
  margin: 0;
  list-style-position: inside;
  list-style-type: ${(props: StyledListProps) => props.listStyleType};
`

interface ListButtonProps {
  listType: ListType
  listStyleType: orderedListTypes | unOrderedListTypes
}

export default (props: ListButtonProps) => {
  const StyledList = props.listType === 'ul' ? StyledUl : StyledOl

  return (
    <RichButton
      action={(actions) => {
        props.listType === 'ul'
          ? actions.insertUList(props.listStyleType as unOrderedListTypes)
          : actions.insertOList(props.listStyleType as orderedListTypes)
      }}
    >
      <StyledList listStyleType={props.listStyleType}>
        <li>---</li>
        <li>---</li>
        <li>---</li>
      </StyledList>
    </RichButton>
  )
}
