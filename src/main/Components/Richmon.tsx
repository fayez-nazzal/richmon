import React from 'react'
import { RichButton } from './ButtonComponents'
import Toolbar from './Toolbar'
import EditorWrapper from './EditorWrapper'
import isEqual from 'lodash.isequal'
import ColorList from './ColorList'
import styled, { css } from 'styled-components'
import FontSizeMenu from './FontSizeMenu'
import TableList from './TableMenu'
import UnOrderedLists from './UnOrderedList'
import OrderedLists from './OrderedList'
import Spacer from './Spacer'
import Seperator from './Seperator'
import { ReactComponent as PenIcon } from '../../svgs/pen.svg'
import { ReactComponent as NumberedListIcon } from '../../svgs/numberedList.svg'

interface RichmonPropTypes {
  height: string
  width: string
  tools: (JSX.Element | string)[]
  onChange: { (html: string): void }
  content: string
  css: string
  editorCss: string
  toolbarCss: string
  caretColor: string
  defaultTextColor: string
  defaultFontSize: string
  defaultHighlightColor: string
  defaultButtonHeight: string
  disableSmootCaret: boolean
  editorPadding: string
  defaultButtonWidth: string
  caretDelay: string
  defaultBasicTextColorsRows: number
  defaultBasicTextColorsCols: number
  defaultBasicTextHighlightColorsRows: number
  defaultBasicTextHighlightColorsCols: number
  defaultBasicTextShadowColorsRows: number
  defaultBasicTextShadowColorsCols: number
  defaultFeaturedTextColorsRows: number
  defaultFeaturedTextColorsCols: number
  defaultFeaturedTextHighlightColorsRows: number
  defaultFeaturedTextHighlightColorsCols: number
  defaultFeaturedTextShadowColorsRows: number
  defaultFeaturedTextShadowColorsCols: number
  defaultCustomTextColorsRows: number
  defaultCustomTextColorsCols: number
  defaultCustomTextHighlightColorsRows: number
  defaultCustomTextHighlightColorsCols: number
  defaultCustomTextShadowColorsRows: number
  defaultCustomTextShadowColorsCols: number
  textColorsHasCustom: boolean
  textHighlightColorsHasCustom: boolean
  textShadowColorsHasCustom: boolean
  defaultBasicTextColorsCss: string[]
  defaultFeaturedTextColorsCss: string[]
  defaultFeaturedTextShadowColorsCss: string[]
  defaultBasicTextColors: string[]
  defaultFeaturedTextColors: string[]
  defaultBasicTextHighlightColors: string[]
  defaultBasicTextHighlightColorsCss: string[]
  defaultFeaturedTextHighlightColors: string[]
  defaultBasicTextShadowColors: string[]
  defaultFeaturedTextShadowColors: string[]
  defaultFeaturedTextHighlightColorsCss: string[]
  defaultBasicTextShadowColorsCss: string[]
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
    width: '400px',
    height: '400px',
    caretColor: 'black',
    defaultTextColor: 'black',
    defaultFontSize: '16px',
    defaultHighlightColor: 'transparent',
    editorPadding: '5px 12px',
    caretDelay: '55ms',
    defaultButtonWidth: '34px',
    defaultButtonHeight: '44px',
    disableSmootCaret: false,
    defaultBasicTextColorsRows: 5,
    defaultBasicTextColorsCols: 6,
    defaultBasicTextHighlightColorsRows: 3,
    defaultBasicTextHighlightColorsCols: 6,
    defaultBasicTextShadowColorsRows: 2,
    defaultBasicTextShadowColorsCols: 6,
    defaultFeaturedTextColorsRows: 2,
    defaultFeaturedTextColorsCols: 6,
    defaultFeaturedTextHighlightColorsRows: 1,
    defaultFeaturedTextHighlightColorsCols: 6,
    defaultFeaturedTextShadowColorsRows: 0,
    defaultFeaturedTextShadowColorsCols: 0,
    defaultCustomTextColorsRows: 1,
    defaultCustomTextColorsCols: 6,
    defaultCustomTextHighlightColorsRows: 1,
    defaultCustomTextHighlightColorsCols: 6,
    defaultCustomTextShadowColorsRows: 1,
    defaultCustomTextShadowColorsCols: 6,
    textColorsHasCustom: true,
    textHighlightColorsHasCustom: true,
    textShadowColorsHasCustom: true,
    defaultBasicTextColorsCss: [],

    defaultFeaturedTextColorsCss: [],
    defaultFeaturedTextHighlightColorsCss: [
      `background-color: #ffffff;
             background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='9' viewBox='0 0 8 8'%3E%3Cg fill='%23ededed' fill-opacity='1'%3E%3Cpath fill-rule='evenodd' d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/%3E%3C/g%3E%3C/svg%3E");`
    ],
    defaultFeaturedTextShadowColorsCss: [],
    defaultBasicTextShadowColorsCss: [
      `background-color: #ffffff;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='9' viewBox='0 0 8 8'%3E%3Cg fill='%23ededed' fill-opacity='1'%3E%3Cpath fill-rule='evenodd' d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/%3E%3C/g%3E%3C/svg%3E");`
    ],
    defaultBasicTextColors: [
      '#000000',
      '#5a5a5a',
      '#737373',
      '#8d8d8d',
      '#a6a6a6',
      '#b22222',
      '#ff0000',
      '#ff3b3b',
      '#ff6262',
      '#ff8989',
      '#00b300',
      '#00ff00',
      '#80ff80',
      '#9dff9d',
      '#c4ffc4',
      '#0000b3',
      '#0000ff',
      '#4d4dff',
      '#0080ff',
      '#00ffff',
      '#cccc00',
      '#ffff00',
      '#ffff4e',
      '#ffff89',
      '#ffffb1',
      '#008080',
      '#9370db',
      '#8B4513',
      '#ffa500',
      '#daa520'
    ],
    defaultFeaturedTextColors: [
      '#000000',
      '#00bcd4',
      '#b2ebf2',
      '#a09d9c',
      '#d9adad',
      '#faf3dd',
      '#d789d7',
      '#bbd196',
      '#fcf876',
      '#ee6f57',
      '#f0daa4',
      '#eaac9d'
    ],
    defaultBasicTextHighlightColors: [
      '#000000',
      '#adadad',
      '#e0e0e0',
      '#b30000',
      '#ff0000',
      '#ffb1b1',
      '#00b300',
      '#00ff00',
      '#c4ffc4',
      '#0000c4',
      '#1414ff',
      '#00ffff',
      '#cccc00',
      '#ffff00',
      '#ffffb1',
      '#ff83dd',
      '#c393f0',
      '#e79d4e'
    ],
    defaultBasicTextHighlightColorsCss: [],

    defaultFeaturedTextHighlightColors: [
      '#00000000',
      '#f8ff00',
      '#F5DEB3',
      '#d5cad0',
      '#c7d7cf',
      '#aec2d0'
    ],

    defaultBasicTextShadowColors: [
      '#00000000',
      '#e79d4e',
      '#000000',
      '#adadad',
      '#ff0000',
      '#ff83dd',
      '#00b300',
      '#00ff00',
      '#1414ff',
      '#00ffff',
      '#cccc00',
      '#ffff00'
    ],
    defaultFeaturedTextShadowColors: []
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
            tool_s = <RichButton {...props}>{props.children}</RichButton>
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
              <RichButton
                action={(actions) => {
                  actions.setBold()
                }}
                {...defaultButtonProps}
              >
                B
              </RichButton>,
              <RichButton
                action={(actions) => {
                  actions.setItalic()
                }}
                {...defaultButtonProps}
              >
                I
              </RichButton>,
              <RichButton
                action={(actions) => {
                  actions.setUnderline()
                }}
                {...defaultButtonProps}
                css='text-decoration: underline;'
              >
                U
              </RichButton>,
              <RichButton
                action={(actions) => {
                  actions.setStrikeThrough()
                }}
                {...defaultButtonProps}
                css='text-decoration: line-through;'
              >
                St
              </RichButton>
            ]
            break
          case 'B':
          case 'bold':
            tool_s = (
              <RichButton
                action={(actions) => {
                  actions.setBold()
                }}
                {...defaultButtonProps}
              >
                B
              </RichButton>
            )
            break
          case 'I':
          case 'italic':
            tool_s = (
              <RichButton
                action={(actions) => {
                  actions.setItalic()
                }}
                {...defaultButtonProps}
              >
                I
              </RichButton>
            )
            break
          case 'U':
          case 'underline':
            tool_s = (
              <RichButton
                action={(actions) => {
                  actions.setUnderline()
                }}
                {...defaultButtonProps}
                css='text-decoration: underline;'
              >
                U
              </RichButton>
            )
            break
          case 'S':
          case 'strikethrough':
          case 'linethrough':
            tool_s = (
              <RichButton
                action={(actions) => {
                  actions.setStrikeThrough()
                }}
                {...defaultButtonProps}
                css='text-decoration: line-through;'
              >
                St
              </RichButton>
            )
            break
          case 'sub':
          case 'subscript':
            tool_s = (
              <RichButton
                action={(actions) => {
                  actions.setSub()
                }}
                {...defaultButtonProps}
              >
                x<sub style={{ color: '#90e0ef', fontSize: '9px' }}>2</sub>
              </RichButton>
            )
            break
          case 'sup':
          case 'superscript':
            tool_s = (
              <RichButton
                action={(actions) => {
                  actions.setSup()
                }}
                {...defaultButtonProps}
              >
                x<sup style={{ color: '#90e0ef', fontSize: '9px' }}>2</sup>
              </RichButton>
            )
            break
          case 'bullet':
          case 'bulletList':
            tool_s = (
              <RichButton
                action={(actions) => {
                  actions.insertUList()
                }}
                {...defaultButtonProps}
              >
                B
              </RichButton>
            )
            break
          case 'numberedList':
            tool_s = (
              <RichButton
                action={(actions) => {
                  actions.insertOList()
                }}
                {...defaultButtonProps}
              >
                <NumberedListIcon />
              </RichButton>
            )
            break
          case 'textColor':
            tool_s = (
              <ColorList
                action='textColor'
                initialColor='#000000'
                leftIcon='A'
                basicColors={this.props.defaultBasicTextColors}
                basicRows={this.props.defaultBasicTextColorsRows}
                basicCols={this.props.defaultBasicTextColorsCols}
                basicCss={this.props.defaultBasicTextColorsCss}
                featuredColors={this.props.defaultFeaturedTextColors}
                featuredRows={this.props.defaultFeaturedTextColorsRows}
                featuredCols={this.props.defaultFeaturedTextColorsCols}
                featuredCss={this.props.defaultFeaturedTextColorsCss}
                hasCustom={this.props.textColorsHasCustom}
                customCols={this.props.defaultCustomTextColorsCols}
                customRows={this.props.defaultCustomTextColorsRows}
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
                leftIcon={<PenIcon />}
                basicColors={this.props.defaultBasicTextHighlightColors}
                basicRows={this.props.defaultBasicTextHighlightColorsRows}
                basicCols={this.props.defaultBasicTextHighlightColorsCols}
                basicCss={this.props.defaultBasicTextHighlightColorsCss}
                featuredColors={this.props.defaultFeaturedTextHighlightColors}
                featuredRows={this.props.defaultFeaturedTextHighlightColorsRows}
                featuredCols={this.props.defaultFeaturedTextHighlightColorsCols}
                featuredCss={this.props.defaultFeaturedTextHighlightColorsCss}
                hasCustom={this.props.textHighlightColorsHasCustom}
                customCols={this.props.defaultCustomTextHighlightColorsCols}
                customRows={this.props.defaultCustomTextHighlightColorsRows}
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
                basicColors={this.props.defaultBasicTextShadowColors}
                basicRows={this.props.defaultBasicTextShadowColorsRows}
                basicCols={this.props.defaultBasicTextShadowColorsCols}
                basicCss={this.props.defaultBasicTextShadowColorsCss}
                featuredColors={this.props.defaultFeaturedTextShadowColors}
                featuredRows={this.props.defaultFeaturedTextShadowColorsRows}
                featuredCols={this.props.defaultFeaturedTextShadowColorsCols}
                featuredCss={this.props.defaultFeaturedTextShadowColorsCss}
                hasCustom={this.props.textShadowColorsHasCustom}
                customCols={this.props.defaultCustomTextShadowColorsCols}
                customRows={this.props.defaultCustomTextShadowColorsRows}
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
          tools={this.state.tools}
          width={this.props.width}
          css={this.props.toolbarCss}
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
          disableSmoothCaret={this.props.disableSmootCaret}
          caretColor={this.props.caretColor}
          css={this.props.editorCss}
        />
      </Div>
    )
  }
}

export default Richmon
