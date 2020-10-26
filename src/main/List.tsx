import React from 'react'
import styled, { keyframes } from 'styled-components'

interface ListPropTypes {
  css?: string
  parent: any
  children?: any
  buttonChildren: any
}

interface ListState {
  showContents: boolean
  currentPage: number
}

const openKeyFrames = keyframes`
      0% {
        opacity: 0;
        transform: translateY(-0.3rem);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    `

class List extends React.Component<ListPropTypes, ListState> {
  private selfRef: any = React.createRef()
  constructor(props: any) {
    super(props)
    this.state = {
      showContents: false,
      currentPage: 1
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (e: MouseEvent) => {
    if (this.selfRef && !this.selfRef.current.contains(e.target))
      this.setState({ ...this.state, showContents: false })
  }

  onClick = () => {
    this.setState({ showContents: !this.state.showContents })
  }

  render() {
    console.log(this.props.children)
    const Main = styled.div`
      position: absolute;
      left: 0;
      visibility: ${this.state.showContents ? 'visible' : 'hidden'};
      padding: 8px 6px;
      background-color: white;
      -webkit-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      -moz-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      z-index: 10;
      animation: ${openKeyFrames} 0.14s ease-in-out;
      ${this.props.css};
    `

    return (
      <span style={{ position: 'relative' }} ref={this.selfRef}>
        <button
          onClick={this.onClick}
          onMouseDown={(e) => e.preventDefault()}
          onMouseUp={(e) => e.preventDefault()}
        >
          {this.props.buttonChildren}
        </button>
        <Main
          onClick={(e: React.MouseEvent) => {
            if ((e.target as HTMLElement).nodeName === 'BUTTON') {
              this.setState({ ...this.state, showContents: false })
            }
          }}
        >
          {this.props.children}
        </Main>
      </span>
    )
  }
}

export default List
