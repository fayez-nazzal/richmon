import React from 'react'
import styled, { css } from 'styled-components'
// import styles from '../styles.module.css'
// TODO: make props types for this component

const Div = styled.div`
  background-color: #f7f7f7;
  ${(props: { css: string; width: string }) => css`
    ${props.width};
    ${props.css}
  `}
`

class Toolbar extends React.Component<any> {
  constructor(props: any) {
    super(props)
  }

  componentDidMount() {
    console.log('toolbar mounted')
  }

  componentDidUpdate() {
    console.log('toolbar updated')
  }

  render() {
    return (
      <Div width={this.props.width} css={this.props.css}>
        {this.props.tools.map((tool: JSX.Element, index: number) =>
          React.cloneElement(tool, { key: `tool-${index}` })
        )}
      </Div>
    )
  }
}

export default Toolbar
