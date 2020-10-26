import React from 'react'
import './richmonUtils'
import styled from 'styled-components'

interface FlexProps {
  items: (string | JSX.Element)[]
  css?: string
  parent: any
}

interface FlexState {
  items: (string | JSX.Element)[]
}

class RichmonGrid extends React.Component<FlexProps, FlexState> {
  constructor(props: any) {
    super(props)

    this.state = {
      items: []
    }
  }

  componentDidMount() {
    this.updateItems()
  }

  componentDidUpdate(prevProps: any) {
    if ('items' in this.props.items && prevProps.items !== this.props.items) {
      this.updateItems()
    }
  }

  updateItems = () => {
    const items = this.props.parent.constructTools(
      this.props.items,
      this.state.items,
      this
    )
    this.setState({ ...this.state, items })
    console.log(this.state.items)
  }

  render() {
    const Div = styled.div`
      grid-template-rows: repeat(${this.props.rows}, 1fr);
      grid-template-columns: repeat(${this.props.cols}, 1fr);
      display: grid;
      grid-auto-flow: column;
      grid-gap: 6px;
      ${this.props.css}
    `

    return <Div>{this.state.items}</Div>
  }
}

export default RichmonGrid
