import React from 'react'
import styled, { keyframes } from 'styled-components'

interface ListPropTypes {
  css?: string
  parent: any
  children?: any
  buttonChildren: any
  width?: string
  height?: string
}

interface ListState {
  showContents: boolean
  currentPage: number
  children: any[]
  isAnimationEnabled: boolean
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
      currentPage: 0,
      children: [],
      isAnimationEnabled: true
    }
  }

  componentDidMount() {
    // for every page
    // map all it's childs and change its parent prop
    // save it in children state that does not change
    // display children state
    console.log('list mount')
    const newPages: any[] = []
    React.Children.forEach(this.props.children, (page) => {
      // const newPageChildren: any[] = []
      // React.Children.forEach(page.props.children, (child) => {
      //   newPageChildren.push(React.cloneElement(child, { parent: this }))
      // })
      newPages.push(React.cloneElement(page, { parent: this }))
    })

    this.setState({ ...this.state, children: newPages })

    document.addEventListener('mousedown', this.handleClickOutside)
  }

  mapChildrenParents = () => {}

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (e: MouseEvent) => {
    if (
      this.selfRef &&
      !this.selfRef.current.contains(e.target) &&
      this.state.showContents
    ) {
      this.setState({ ...this.state, showContents: false })
    }
  }

  onClick = () => {
    this.setState({
      showContents: !this.state.showContents,
      currentPage: 0,
      isAnimationEnabled: true
    })
  }

  nextPage = () => {
    if (!this.state.children) return

    this.setState({
      ...this.state,
      isAnimationEnabled: false,
      currentPage: this.state.currentPage + 1
    })
  }

  previousPage = () => {
    if (!this.state.children) return

    this.setState({
      ...this.state,
      isAnimationEnabled: false,
      currentPage: this.state.currentPage - 1
    })
  }

  render() {
    const Main = styled.div`
      position: absolute;
      left: 0;
      width: ${this.props.width ? this.props.width : 'auto'};
      height: ${this.props.height ? this.props.height : 'auto'};
      visibility: ${this.state.showContents ? 'visible' : 'hidden'};
      padding: 6px 4px;
      background-color: white;
      -webkit-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      -moz-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      z-index: 10;
      animation: ${openKeyFrames}
        ${this.state.isAnimationEnabled ? '0.14s' : '0s'} ease-in-out;
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
            const target = e.target as HTMLElement
            if (
              target.nodeName === 'BUTTON' &&
              !target.className.includes('static')
            ) {
              this.setState({
                ...this.state,
                showContents: false
              })
            }
          }}
        >
          <React.Fragment key='pala'>
            {this.props.children[0].props.children}
          </React.Fragment>
        </Main>
      </span>
    )
  }
}

export default List
