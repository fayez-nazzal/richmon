import React from 'react'
import styled, { css, Keyframes, keyframes } from 'styled-components'
import { ActionTypes } from '../../Actions'
import RichButton from './RichButton'
import StyledButtonCss from './styledButtonCss'

interface ButtonPropTypes {
  width: string
  height: string
  css?: string
}
const Button = styled.button`
  ${(props: ButtonPropTypes) => css`
    width: ${props.width};
    height: ${props.height};
    ${StyledButtonCss};
    ${props.css};
  `}
`

const ButtonWrapper = styled.span`
  ${(props: { css?: string }) => css`
    ${props.css};
  `}
`

const OpenAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-0.27rem)
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`

interface StyledListProps {
  width: string
  height: string
  visibility: string
  animation: Keyframes | null
  css?: string
}

const StyledList = styled.div`
  position: absolute;
  left: 0;
  background-color: white;
  -webkit-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
  -moz-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
  box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
  z-index: 10;
  ${(props: StyledListProps) => css`
    width: ${props.width};
    height: ${props.height};
    visibility: ${props.visibility};
    ${props.css};
    animation: ${props.animation} 0.14s ease-in-out;
  `}
`

interface RichMenuPropTypes {
  children?: any
  width?: string
  height?: string
  buttonChildren: any
  buttonHeight: string
  buttonWidth: string
  buttonCss?: string
  actionButtonAction?: { (actions: ActionTypes): void }
  actionButtonChildren?: (JSX.Element | string)[] | JSX.Element | string
  actionButtonCss?: string
  buttonWrapperCss?: string
  css?: string
}

interface RichMenuState {
  showContents: boolean
  currentPage: number
  children: any[]
  isAnimationEnabled: boolean
}

class RichMenu extends React.Component<RichMenuPropTypes, RichMenuState> {
  private selfRef: any = React.createRef()
  private static _opened: RichMenu

  private constructor(props: any) {
    super(props)
    this.state = {
      showContents: false,
      currentPage: 0,
      children: [],
      isAnimationEnabled: true
    }
  }

  componentDidMount() {
    console.log(this.props.actionButtonCss)
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
    RichMenu._opened = this
    this.setState({
      showContents: !this.state.showContents,
      currentPage: 0,
      isAnimationEnabled: true
    })
  }

  public static getOpened() {
    return this._opened
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

  onInnerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (
      ['li', 'ul', 'ol', 'button'].includes(target.nodeName.toLowerCase()) &&
      !target.className.includes('page-button')
    ) {
      this.setState({
        ...this.state,
        showContents: false
      })
    }
  }

  render() {
    return (
      <span style={{ position: 'relative' }} ref={this.selfRef}>
        <ButtonWrapper css={this.props.buttonWrapperCss}>
          {this.props.actionButtonChildren ? (
            <RichButton
              css={this.props.actionButtonCss}
              action={
                this.props.actionButtonAction
                  ? this.props.actionButtonAction
                  : () => {
                      this.onClick()
                    }
              }
              width={this.props.buttonWidth}
              height={this.props.buttonHeight}
            >
              {this.props.actionButtonChildren}
            </RichButton>
          ) : (
            ''
          )}
          <Button
            width={
              this.props.actionButtonChildren ? 'auto' : this.props.buttonWidth
            }
            height={this.props.buttonHeight}
            onClick={this.onClick}
            onMouseDown={(e) => {
              e.preventDefault()
            }}
            css={this.props.buttonCss}
          >
            {this.props.buttonChildren}
          </Button>
        </ButtonWrapper>
        <StyledList
          width={this.props.width ? this.props.width : 'auto'}
          height={this.props.height ? this.props.height : 'auto'}
          visibility={this.state.showContents ? 'visible' : 'hidden'}
          onClick={this.onInnerClick}
          animation={this.state.showContents ? OpenAnimation : null}
          css={this.props.css}
        >
          {React.Children.map(this.props.children, (child, index) => {
            return React.cloneElement(child, {
              key: `page${index}`,
              display: index === this.state.currentPage
            })
          })}
        </StyledList>
      </span>
    )
  }
}

export default RichMenu
