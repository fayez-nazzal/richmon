import React from 'react'
import './richmonUtils'
import styled from 'styled-components'
import isEqual from 'lodash.isequal'

interface GridProps {
  rows: number
  cols: number
  css?: string
  parent?: any
  children?: any
  shouldUpdate?: boolean
}

interface GridState {}

class RichmonGrid extends React.Component<GridProps, GridState> {
  constructor(props: any) {
    super(props)

    this.state = {}
  }

  private Div = styled.div`
    grid-template-rows: repeat(${this.props.rows}, 1fr);
    grid-template-columns: repeat(${this.props.cols}, 1fr);
    display: grid;
    grid-auto-flow: column;
    grid-gap: 6px;
  `

  componentDidMount() {
    console.log('grid mount')
  }

  componentDidUpdate() {
    console.log('grid update')
  }

  shouldComponentUpdate(prevProps: any) {
    return (
      !isEqual(prevProps, this.props) && this.props.shouldUpdate !== undefined
    )
  }

  render() {
    const Div = this.Div
    return (
      <Div>
        {React.Children.map(
          this.props.children,
          (child: JSX.Element, index) => {
            if (!('type' in child))
              throw new Error(
                'found a child of Grid which is not a JSX Element'
              )
            return React.cloneElement(child, {
              parent: this,
              key: `grid_item${index}`
            })
          }
        )}
      </Div>
    )
  }
}

export default RichmonGrid
