import React from 'react'
import { RichmonListProps } from './types'
import './richmonUtils'
import styled from 'styled-components'

class RichmonList extends React.Component<
  RichmonListProps,
  { showContents: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      showContents: false
    }
  }

  render() {
    const List = styled.div`
      display: flex;
      flex-wrap: wrap;
      position: absolute;
      padding: 8px 6px;
      background-color: white;
      border: 1px solid black;
    `
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            this.setState({ showContents: !this.state.showContents })
          }}
          onMouseDown={(e) => e.preventDefault()}
          onMouseUp={(e) => e.preventDefault()}
        >
          {this.props.text}
        </button>
        <List hidden={!this.state.showContents}>{this.props.tools}</List>
      </div>
    )
  }
}

export default RichmonList
