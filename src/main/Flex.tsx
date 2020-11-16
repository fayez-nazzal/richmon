import styled from 'styled-components'

interface FlexProps {
  height?: string
  justifyContent?: string
}

export default styled.div`
  display: flex;
  width: 140px;
  justify-content: ${(props: FlexProps) =>
    props.justifyContent ? props.justifyContent : 'initial'};
  height: ${(props: FlexProps) => (props.height ? props.height : 'auto')};
  user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
`
