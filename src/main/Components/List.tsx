import React from 'react'
import styled, { css } from 'styled-components'
import { Actions } from '../../EditorActions'
import RichButton from './RichButton'
import StyledButtonCss from './StyledButtonCss'

interface ListPropTypes {
  css?: string
  children?: any
  buttonChildren: any
  width?: string
  height?: string
  leftButtonCss?: string
  leftButtonAction?: { (actions: Actions): void }
  leftButtonChildren?: (JSX.Element | string)[] | JSX.Element | string
  buttonCss?: string
  buttonWrapperCss?: string
  buttonHeight: string
  buttonWidth: string
}

interface ListState {
  showContents: boolean
  currentPage: number
  children: any[]
  isAnimationEnabled: boolean
}

const Button = styled.button`
  ${(props: { css?: string; width: string; height: string }) => css`
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

interface StyledListProps {
  width: string
  height: string
  visibility: string
  css?: string
}

const StyledList = styled.div`
  position: absolute;
  left: 0;
  width: ${(props: StyledListProps) => props.width};
  height: ${(props: StyledListProps) => props.height};
  visibility: ${(props: StyledListProps) => props.visibility};
  background-color: white;
  -webkit-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
  -moz-box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
  box-shadow: 0px 1px 14px -3px rgba(206, 206, 206, 1);
  z-index: 10;
  ${(props: StyledListProps) => props.css}
`

class List extends React.Component<ListPropTypes, ListState> {
  private selfRef: any = React.createRef()
  private static _opened: List

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
    List._opened = this
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

  render() {
    return (
      <span id='sppp' style={{ position: 'relative' }} ref={this.selfRef}>
        <ButtonWrapper css={this.props.buttonWrapperCss}>
          {this.props.leftButtonChildren ? (
            <RichButton
              css={this.props.leftButtonCss}
              action={
                this.props.leftButtonAction
                  ? this.props.leftButtonAction
                  : () => {
                      this.onClick()
                    }
              }
              width={this.props.buttonWidth}
              height={this.props.buttonHeight}
            >
              {this.props.leftButtonChildren}
            </RichButton>
          ) : (
            ''
          )}
          <Button
            width='auto'
            height={this.props.buttonHeight}
            css={this.props.buttonCss}
            onClick={this.onClick}
            onMouseDown={(e) => {
              e.preventDefault()
            }}
          >
            {this.props.buttonChildren}
          </Button>
        </ButtonWrapper>
        <StyledList
          onClick={(e: React.MouseEvent) => {
            const target = e.target as HTMLElement
            if (
              ['li', 'ul', 'ol', 'button'].includes(
                target.nodeName.toLowerCase()
              ) &&
              !target.className.includes('page-button')
            ) {
              this.setState({
                ...this.state,
                showContents: false
              })
            }
          }}
          width={this.props.width ? this.props.width : 'auto'}
          height={this.props.height ? this.props.height : 'auto'}
          visibility={this.state.showContents ? 'visible' : 'hidden'}
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

export default List
