import React from 'react'
import RichmonButton from './RichButton'
import Toolbar from './Toolbar'
import EditorWrapper from './EditorWrapper'
import isEqual from 'lodash.isequal'
import { ReactComponent as Pen } from '../../svgs/pen.svg'
import ColorList from './ColorList'
import styled, { css } from 'styled-components'
import { config } from '../../config'
import FontSizeMenu from './FontSizeMenu'
import TableList from './TableList'
import UnOrderedLists from './UnOrderedLists'
import OrderedLists from './OrderedLists'
import Spacer from './Spacer'
import Seperator from './Seperator'

interface RichmonPropTypes {
  defaultTextColor: string
  defaultHighlightColor: string
  defaultFontSize: string
  height: string
  width: string
  tools: (JSX.Element | string)[]
  onChange: { (html: string): void }
  content: string
  editorPadding: string
  css: string
  editorCss: string
  defaultButtonWidth: string
  defaultButtonHeight: string
  toolbarCss: string
  caretDelay: string
  caretColor: string
  disableSmootCaret: boolean
}

type RichmonState = {
  tools: JSX.Element[]
}

const Div = styled.div`
  -webkit-box-shadow: 0px 0px 3px 2px #888888;
  box-shadow: 0px 0px 3px 2px #888888;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  ${(props: { width: string; height: string; css: string }) =>
    css`
      width: ${props.width};
      height: ${props.height};
      ${props.css}
    `}
`

class Richmon extends React.Component<RichmonPropTypes, RichmonState> {
  public static defaultProps: Partial<RichmonPropTypes> = {
    defaultTextColor: 'black',
    defaultFontSize: '16px',
    defaultHighlightColor: 'transparent',
    width: '400px',
    height: '400px',
    editorPadding: '5px 12px',
    caretDelay: '55ms',
    defaultButtonWidth: '34px',
    defaultButtonHeight: '44px',
    disableSmootCaret: false,
    caretColor: 'black'
  }

  public editor = React.createRef()

  constructor(props: any) {
    super(props)

    this.state = {
      tools: []
    }
  }

  updateTools = () => {
    const tools = this.constructTools(this.props.tools as any[])
    this.setState({ ...this.state, tools })
  }

  componentDidMount() {
    this.updateTools()
  }

  componentDidUpdate(prevProps: any) {
    if (!isEqual(prevProps, this.props)) {
      this.updateTools()
    }
  }

  shouldComponentUpdate(prevProps: any, prevState: any) {
    return (
      !isEqual({ ...prevProps, content: '' }, { ...this.props, content: '' }) ||
      !isEqual(
        { ...prevState, isCaretHidden: false },
        { ...this.state, isCaretHidden: false }
      )
    )
  }

  private constructTools = (fromArray: any[]) => {
    const toolsProp = fromArray
    const tools = []

    for (let i = 0; i < toolsProp.length; i++) {
      const toolProp = toolsProp[i]
      let tool_s: any

      if (typeof toolProp !== 'string') {
        const props = toolProp.props
        switch (toolProp.type.name) {
          case 'RichButton':
            alert('rich button')
            tool_s = <RichmonButton {...props}>{props.children}</RichmonButton>
            break
          default:
            tool_s = toolProp
        }
      } else {
        const defaultButtonProps = {
          width: this.props.defaultButtonWidth,
          height: this.props.defaultButtonHeight
        }

        switch (toolProp) {
          case 'BIUS':
            tool_s = [
              <RichmonButton
                action={(actions) => {
                  actions.setBold()
                }}
                {...defaultButtonProps}
              >
                B
              </RichmonButton>,
              <RichmonButton
                action={(actions) => {
                  actions.setItalic()
                }}
                {...defaultButtonProps}
              >
                I
              </RichmonButton>,
              <RichmonButton
                action={(actions) => {
                  actions.setUnderline()
                }}
                {...defaultButtonProps}
                css='text-decoration: underline;'
              >
                U
              </RichmonButton>,
              <RichmonButton
                action={(actions) => {
                  actions.setStrikeThrough()
                }}
                {...defaultButtonProps}
                css='text-decoration: line-through;'
              >
                St
              </RichmonButton>
            ]
            break
          case 'B':
          case 'bold':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.setBold()
                }}
                {...defaultButtonProps}
              >
                B
              </RichmonButton>
            )
            break
          case 'I':
          case 'italic':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.setItalic()
                }}
                {...defaultButtonProps}
              >
                I
              </RichmonButton>
            )
            break
          case 'U':
          case 'underline':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.setUnderline()
                }}
                {...defaultButtonProps}
                css='text-decoration: underline;'
              >
                U
              </RichmonButton>
            )
            break
          case 'S':
          case 'strikethrough':
          case 'linethrough':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.setStrikeThrough()
                }}
                {...defaultButtonProps}
                css='text-decoration: line-through;'
              >
                St
              </RichmonButton>
            )
            break
          case 'sub':
          case 'subscript':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.setSub()
                }}
                {...defaultButtonProps}
              >
                x<sub style={{ color: '#90e0ef', fontSize: '9px' }}>2</sub>
              </RichmonButton>
            )
            break
          case 'sup':
          case 'superscript':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.setSup()
                }}
                {...defaultButtonProps}
              >
                x<sup style={{ color: '#90e0ef', fontSize: '9px' }}>2</sup>
              </RichmonButton>
            )
            break
          case 'bullet':
          case 'bulletList':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.insertUList()
                }}
                {...defaultButtonProps}
              >
                B
              </RichmonButton>
            )
            break
          case 'numberedList':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.insertOList()
                }}
                {...defaultButtonProps}
              >
                B
              </RichmonButton>
            )
            break
          case 'romanList':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.insertOList('upper-roman')
                }}
                {...defaultButtonProps}
              >
                B
              </RichmonButton>
            )
            break
          case 'alphaList':
          case 'lowerAlphaList':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.insertOList('lower-alpha')
                }}
                {...defaultButtonProps}
              >
                B
              </RichmonButton>
            )
            break
          case 'upperAlphaList':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.insertOList('upper-alpha')
                }}
                {...defaultButtonProps}
              >
                B
              </RichmonButton>
            )
            break
          case 'squareList':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.insertUList('square')
                }}
                {...defaultButtonProps}
              >
                B
              </RichmonButton>
            )
            break
          case 'textColor':
            tool_s = (
              <ColorList
                action='textColor'
                initialColor='#000000'
                leftIcon='A'
                basicColors={config.defaultBasicTextColors}
                basicRows={config.defaultBasicTextColorsRows}
                basicCols={config.defaultBasicTextColorsCols}
                basicCss={config.defaultBasicTextColorsCss}
                featuredColors={config.defaultFeaturedTextColors}
                featuredRows={config.defaultFeaturedTextColorsRows}
                featuredCols={config.defaultFeaturedTextColorsCols}
                featuredCss={config.defaultFeaturedTextColorsCss}
                hasCustom={config.textColorsHasCustom}
                customCols={config.defaultCustomTextColorsCols}
                customRows={config.defaultCustomTextColorsRows}
                buttonWidth={this.props.defaultButtonWidth}
                buttonHeight={this.props.defaultButtonHeight}
              />
            )
            break
          case 'textHighlight':
            tool_s = (
              <ColorList
                action='textHighlight'
                initialColor='#ffff00'
                leftIcon={<Pen />}
                basicColors={config.defaultBasicTextHighlightColors}
                basicRows={config.defaultBasicTextHighlightColorsRows}
                basicCols={config.defaultBasicTextHighlightColorsCols}
                basicCss={config.defaultBasicTextHighlightColorsCss}
                featuredColors={config.defaultFeaturedTextHighlightColors}
                featuredRows={config.defaultFeaturedTextHighlightColorsRows}
                featuredCols={config.defaultFeaturedTextHighlightColorsCols}
                featuredCss={config.defaultFeaturedTextHighlightColorsCss}
                hasCustom={config.textHighlightColorsHasCustom}
                customCols={config.defaultCustomTextHighlightColorsCols}
                customRows={config.defaultCustomTextHighlightColorsRows}
                buttonWidth={this.props.defaultButtonWidth}
                buttonHeight={this.props.defaultButtonHeight}
              />
            )
            break
          case 'textShadow':
            tool_s = (
              <ColorList
                action='textShadow'
                initialColor='#ff3b3b'
                basicColors={config.defaultBasicTextShadowColors}
                basicRows={config.defaultBasicTextShadowColorsRows}
                basicCols={config.defaultBasicTextShadowColorsCols}
                basicCss={config.defaultBasicTextShadowColorsCss}
                featuredColors={config.defaultFeaturedTextShadowColors}
                featuredRows={config.defaultFeaturedTextShadowColorsRows}
                featuredCols={config.defaultFeaturedTextShadowColorsCols}
                featuredCss={config.defaultFeaturedTextShadowColorsCss}
                hasCustom={config.textShadowColorsHasCustom}
                customCols={config.defaultCustomTextShadowColorsCols}
                customRows={config.defaultCustomTextShadowColorsRows}
                buttonWidth={this.props.defaultButtonWidth}
                buttonHeight={this.props.defaultButtonHeight}
              />
            )
            break
          case 'fontSize':
            tool_s = (
              <FontSizeMenu
                buttonWidth={this.props.defaultButtonWidth}
                buttonHeight={this.props.defaultButtonHeight}
                defaultFontSize={this.props.defaultFontSize}
              />
            )
            break
          case 'table':
            tool_s = (
              <TableList
                buttonWidth={this.props.defaultButtonWidth}
                buttonHeight={this.props.defaultButtonHeight}
              />
            )
            break
          case 'unorderedList':
            tool_s = (
              <UnOrderedLists
                buttonWidth={this.props.defaultButtonWidth}
                buttonHeight={this.props.defaultButtonHeight}
              />
            )
            break
          case 'orderedList':
            tool_s = (
              <OrderedLists
                buttonWidth={this.props.defaultButtonWidth}
                buttonHeight={this.props.defaultButtonHeight}
              />
            )
            break
          case 'narrow-spacer':
            tool_s = (
              <Spacer width='2px' height={this.props.defaultButtonHeight} />
            )
            break
          case 'spacer':
            tool_s = (
              <Spacer width='3px' height={this.props.defaultButtonHeight} />
            )
            break
          case 'wide-spacer':
            tool_s = (
              <Spacer width='6px' height={this.props.defaultButtonHeight} />
            )
            break
          case 'thin-seperator':
            tool_s = (
              <Seperator
                color='#00000050'
                thickness='1px'
                height={`${parseInt(this.props.defaultButtonHeight) - 10}px`}
              />
            )
            break
          case 'seperator':
            tool_s = (
              <Seperator
                color='#00000050'
                thickness='2px'
                height={`${parseInt(this.props.defaultButtonHeight) - 10}px`}
              />
            )
            break
          case 'thick-seperator':
            tool_s = (
              <Seperator
                color='#00000050'
                thickness='3px'
                height={`${parseInt(this.props.defaultButtonHeight) - 10}px`}
              />
            )
            break
          default:
            alert('un implement')
        }
      }
      if (tool_s.length) for (let tool of tool_s) tools.push(tool)
      else tools.push(tool_s)
    }
    return tools
  }

  render() {
    return (
      <Div
        className='richmon-container'
        width={this.props.width}
        height={this.props.height}
        css={this.props.css}
      >
        <Toolbar
          css={this.props.toolbarCss}
          tools={this.state.tools}
          width={this.props.width}
        />
        <EditorWrapper
          caretDelay={this.props.caretDelay}
          width={this.props.width}
          height={this.props.height}
          padding={this.props.editorPadding}
          defaultFontSize={this.props.defaultFontSize}
          defaultHighlightColor={this.props.defaultHighlightColor}
          defaultTextColor={this.props.defaultTextColor}
          editorRef={this.editor}
          onChange={this.props.onChange}
          content={this.props.content}
          css={this.props.editorCss}
          disableSmoothCaret={this.props.disableSmootCaret}
          caretColor={this.props.caretColor}
        />
      </Div>
    )
  }
}

export default Richmon
