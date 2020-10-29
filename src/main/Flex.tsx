import React from 'react'
import './richmonUtils'
import styled from 'styled-components'
import isEqual from 'lodash.isequal'

interface FlexProps {
  items: (string | JSX.Element)[]
  css?: string
  parent?: any
}

interface FlexState {
  items: (string | JSX.Element)[]
}

class Flex extends React.Component<FlexProps, FlexState> {
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

  shouldComponentUpdate(prevProps: any, prevState: any) {
    console.log(prevProps, this.props)
    console.log(prevState, this.state)
    return !isEqual(prevProps, this.props) || !isEqual(prevState, this.state)
  }

  updateItems = () => {
    let richmon = this.props.parent
    console.log(richmon)
    while (richmon.constructor.name !== 'Richmon') {
      richmon = richmon.props.parent
    }
    const items = richmon.constructTools(this.props.items, this)
    this.setState({ ...this.state, items })
    console.log(this.state.items)
  }

  render() {
    const Div = styled.div`
      display: flex;
      flex: 1 1 auto;
      justify-content: center;
      ${this.props.css}
    `

    return (
      <Div>
        {React.Children.map(this.state.items, (child: any, index) =>
          React.cloneElement(child, { parent: this.props.parent, key: index })
        )}
      </Div>
    )
  }
}

export default Flex
