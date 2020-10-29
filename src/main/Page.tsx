import React from 'react'
import styled from 'styled-components'

export interface PagePropTypes {
  parent?: any
  children?: any
  css?: string
  display?: boolean
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

  render() {
    const Div = this.Div
    return (
      <Div
        className='page'
        style={{
          display: this.props.display ? 'block' : 'none'
        }}
      >
        {React.Children.map(this.props.children, (child, index) => {
          return React.cloneElement(child, {
            parent: this.props.parent,
            key: `page_item_${index}`
          })
        })}
      </Div>
    )
  }
}

export default Page
