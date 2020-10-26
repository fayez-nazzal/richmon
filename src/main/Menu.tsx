import React from 'react'
import { RichmonListProps } from './types'
import './richmonUtils'
import styled, { keyframes } from 'styled-components'

class RichmonList extends React.Component<
  RichmonListProps,
  { showContents: boolean }
> {
  private selfRef: any = React.createRef()

  constructor(props: any) {
    super(props)
    this.state = {
      showContents: false
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

  render() {
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

    const List = styled.div`
      position: absolute;
      background-color: white;
      padding: 8px 6px;
      display: flex;
      flex-wrap: wrap;
      flex-direction: ${this.props.dir};
      -webkit-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      -moz-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      z-index: 10;
      left: 0;
      visibility: ${this.state.showContents ? 'visible' : 'hidden'};
      animation: ${openKeyFrames} 0.14s ease-in-out;
      height: ${(this.props.tools.length * 12.8) / 5 + 20}px;100px;
      width: ${(this.props.tools.length * 12.8) / 5}px;
    `
    return (
      <span style={{ position: 'relative' }} ref={this.selfRef}>
        <button
          onClick={() => {
            this.setState({ showContents: !this.state.showContents })
          }}
          onMouseDown={(e) => e.preventDefault()}
          onMouseUp={(e) => e.preventDefault()}
        >
          {this.props.children}
        </button>
        <List
          onClick={(e: React.MouseEvent) => {
            if ((e.target as HTMLElement).nodeName === 'BUTTON') {
              this.setState({ ...this.state, showContents: false })
            }
          }}
        >
          {this.props.tools}
        </List>
      </span>
    )
  }
}

export default RichmonList
