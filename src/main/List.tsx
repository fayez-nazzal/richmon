import React from 'react'
import styled from 'styled-components'
import styles from '../styles.module.css'

interface ListPropTypes {
  css?: string
  parent: any
  children?: any
  buttonChildren: any
  width?: string
  height?: string
  leftButton?: JSX.Element
  rightButton?: JSX.Element
  buttonCss?: string
  buttonWrapperCss?: string
}

interface ListState {
  showContents: boolean
  currentPage: number
  children: any[]
  isAnimationEnabled: boolean
}

class List extends React.Component<ListPropTypes, ListState> {
  private selfRef: any = React.createRef()
  private Main: any

  constructor(props: any) {
    super(props)
    this.state = {
      showContents: false,
      currentPage: 0,
      children: [],
      isAnimationEnabled: true
    }
    this.Main = styled.div`
      position: absolute;
      left: 0;
      background-color: white;
      -webkit-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      -moz-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
      z-index: 10;
      ${this.props.css}
    `
  }

  componentDidMount() {
    const newPages = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, { parent: this })
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

  private Button = styled.button`
    ${this.props.buttonCss};
  `

  private ButtonWrapper = styled.span`
    ${this.props.buttonWrapperCss}
  `

  render() {
    const Button = this.Button
    const ButtonWrapper = this.ButtonWrapper

    return (
      <span id='sppp' style={{ position: 'relative' }} ref={this.selfRef}>
        <ButtonWrapper className={styles['list-button-wrapper']}>
          {this.props.leftButton
            ? React.cloneElement(this.props.leftButton, { parent: this })
            : ''}
          <Button
            className={styles.button}
            onClick={this.onClick}
            onMouseDown={(e) => {
              e.preventDefault()
            }}
          >
            {this.props.buttonChildren}
          </Button>
          {this.props.rightButton
            ? React.cloneElement(this.props.rightButton, { parent: this })
            : ''}
        </ButtonWrapper>
        <this.Main
          extraCss={this.props.css ? this.props.css : ''}
          style={{
            width: this.props.width ? this.props.width : 'auto',
            height: this.props.height ? this.props.height : 'auto',
            visibility: this.state.showContents ? 'visible' : 'hidden'
          }}
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
          {this.state.children[this.state.currentPage]}
        </this.Main>
      </span>
    )
  }
}

export default List
