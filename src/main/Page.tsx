import React from 'react'
import styled from 'styled-components'

export interface PagePropTypes {
  parent?: any
  children?: any
  css?: string
  className?: string
}

export interface PageState {
  children: any[]
}

class Page extends React.Component<PagePropTypes, PageState> {
  private Div: any
  constructor(props: any) {
    super(props)
    this.state = {
      children: []
    }
    this.Div = styled.div`
      padding: 0;
      ${this.props.css};
    `
  }

  componentDidMount() {
    const children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, { parent: this.props.parent })
    })

    this.setState({ ...this.state, children })
  }

  render() {
    const Div = this.Div
    return <Div className='page'>{...this.state.children}</Div>
  }
}

export default Page
