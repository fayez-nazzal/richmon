import React from 'react'
import styled from 'styled-components'
// import styles from '../styles.module.css'
// TODO: make props types for this component
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

  private Div = styled.div`
    width: ${this.props.width};
    background-color: #f7f7f7;
  `
  render() {
    const Div = this.Div
    return (
      <Div>
        {this.props.tools.map((tool: JSX.Element, index: number) =>
          React.cloneElement(tool, { key: `tool-${index}` })
        )}
      </Div>
    )
  }
}

export default Toolbar
