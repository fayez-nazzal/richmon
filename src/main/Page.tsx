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
  constructor(props: any) {
    super(props)
    this.state = {
      children: []
    }
  }

  componentDidMount() {
    const children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, { parent: this.props.parent })
    })

    this.setState({ ...this.state, children })
    alert('page mount')
  }

  render() {
    console.warn('page updaed')
    const Div = styled.div`
      ${this.props.css};
    `
    return <Div className='page'>{...this.state.children}</Div>
  }
}

export default Page
