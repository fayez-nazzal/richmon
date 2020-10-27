import React from 'react'
import './richmonUtils'
import styled from 'styled-components'

interface GridProps {
  rows: number
  cols: number
  items: (string | JSX.Element)[]
  css?: string
  parent?: any
}

interface GridState {
  items: (string | JSX.Element)[]
  itemKeys: string[]
}

class RichmonGrid extends React.Component<GridProps, GridState> {
  constructor(props: any) {
    super(props)

    this.state = {
      items: [],
      itemKeys: []
    }
  }

  componentDidMount() {
    console.log('grid mount')
    this.updateItems()
  }

  componentDidUpdate(prevProps: any) {
    if ('items' in this.props.items && prevProps.items !== this.props.items) {
      this.updateItems()
    }
  }

  updateItems = () => {
    console.log('grid udate')

    // let richmon = this.props.parent

    // while (richmon.constructor.name !== 'Richmon') {
    //   richmon = richmon.props.parent
    // }

    // const items = richmon.constructTools(this.props.items, this)
    // this.setState({ ...this.state, items })
  }

  render() {
    const Div = styled.div`
      grid-template-rows: repeat(${this.props.rows}, 1fr);
      grid-template-columns: repeat(${this.props.cols}, 1fr);
      display: grid;
      grid-auto-flow: column;
      grid-gap: 6px;
    `

    return <Div>{this.state.items}</Div>
  }
}

export default RichmonGrid
