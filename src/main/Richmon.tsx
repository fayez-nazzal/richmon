import React from 'react'
import { RichmonPropTypes, Text, position } from './types'
import { RichmonState } from './RichmonState'
import RichmonButton from './Button'
import Toolbar from './Toolbar'
import Editor from './Editor'
import Caret from './Caret'
import styled from 'styled-components'
import isEqual from 'lodash.isequal'
import ColorPicker from './ColorPickList'

const defaultProps = {
  config: {
    defaultTheme: 'light',
    defaultTextColor: 'black',
    defaultFontSize: '18px',
    defaultHighlightColor: 'transparent',
    imageTools: ['delete']
  }
}

class Richmon extends React.Component<RichmonPropTypes, RichmonState> {
  public static defaultProps = defaultProps

  public editor: any = React.createRef()

  public colorsGridFirstRow: any[] | any

  constructor(props: any) {
    super(props)

    this.state = {
      tools: [],
      colorsGridExtraCss: 'border: 1px solid blue;',
      textColor: 'black',
      highlightColor: 'transparent',
      isCaretHidden: true,
      caretPosition: { left: 0, top: 0 },
      html: '<div></div>',
      textToAdd: [],
      italic: false,
      bold: false,
      fontSize: '14px',
      StyledCaret: styled((props) => <Caret {...props} />)`
        white-space: pre;
        position: absolute;
        left: ${(props) => props.left + 'px'};
        top: ${(props) => props.top + 'px'};
        pointer-events: none;
        border-right: 1.2px solid black;
        transition: left 65ms ease-in;
      `,
      choosedColor: 'white'
    }
  }

  updateTools = () => {
    const tools = this.constructTools(this.props.top as any[], this)
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
      !isEqual(prevProps, this.props) ||
      !isEqual(
        { ...prevState, isCaretHidden: false },
        { ...this.state, isCaretHidden: false }
      )
    )
  }

  // Example actions=["textColor(red)"]
  public setTextColor = (textColor: string) => {
    this.setState({ ...this.state, textColor })
  }

  // Example actions=["bold"]
  public setBold = () => {
    this.setState({ ...this.state, bold: !this.state.bold })
  }

  // Example actions=["italic"]
  public setItalic = () => {
    this.setState({ ...this.state, italic: !this.state.italic })
  }

  // Example actions=["addText{text: hello, color: blue, hgColor: yellow, size: 18px}"]
  public addText = ({ text, color, hgColor, size }: Text) => {
    color = color === 'default' ? this.props.config?.defaultTextColor : color
    hgColor =
      hgColor === 'default' ? this.props.config?.defaultHighlightColor : hgColor
    size = size === 'default' ? this.props.config?.defaultFontSize : size

    const style = {}

    if (color) style['color'] = color

    if (hgColor) style['backgroundColor'] = hgColor

    if (size) style['fontSize'] = size

    const textToAdd = [...this.state.textToAdd]
    textToAdd.push(
      <span className='text' style={style}>
        {text}
      </span>
    )
    this.setState({ ...this.state, textToAdd })
  }

  private constructTools = (fromArray: any[], parent: any) => {
    const toolsProp = fromArray
    const tools = []

    for (let i = 0; i < toolsProp.length; i++) {
      const toolProp = toolsProp[i]
      let tool_s: any

      if (typeof toolProp !== 'string') {
        const props = toolProp.props
        switch (toolProp.type.name) {
          case 'RichButton':
            tool_s = (
              <RichmonButton {...props} parent={parent}>
                {props.children}
              </RichmonButton>
            )
            break
          default:
            tool_s = toolProp
        }
      } else {
        switch (toolProp) {
          case 'BIU':
            tool_s = [
              <RichmonButton actions={['bold']} parent={parent}>
                B
              </RichmonButton>,
              <RichmonButton actions={['italic']} parent={parent}>
                I
              </RichmonButton>,
              <RichmonButton actions={['underline']} parent={parent}>
                U
              </RichmonButton>
            ]
            break
          case 'highlightColors':
          case 'textColors':
            tool_s = <ColorPicker parent={parent} />
            break
          case 'sup':
            tool_s = (
              <RichmonButton actions={['sup']} parent={parent}>
                sup
              </RichmonButton>
            )
            break
          case 'delete':
            tool_s = (
              <RichmonButton
                actions={['delete']}
                parent={parent}
              ></RichmonButton>
            )
            break
          case 'B':
          case 'bold':
            tool_s = (
              <RichmonButton actions={['bold']} parent={parent}>
                B
              </RichmonButton>
            )
            break
          case 'I':
          case 'italic':
            tool_s = (
              <RichmonButton actions={['italic']} parent={parent}>
                I
              </RichmonButton>
            )
            break
          default:
            let toolName = toolProp.match(/[a-zA-Z]*(?=\()/)![0]
            let toolArgs = toolProp.match(/\(\s*([^)]+?)\s*\)/)![1].split(', ')
            switch (toolName) {
              case 'textColor':
                tool_s = (
                  <RichmonButton
                    actions={[`textColor(${toolArgs[0]})`]}
                    parent={parent}
                  />
                )
                break
            }
        }
      }
      if (tool_s.length) for (let tool of tool_s) tools.push(tool)
      else tools.push(tool_s)
    }
    return tools
  }

  setEditorHTML = (html: string) => {
    this.setState({ ...this.state, html })
  }

  setCaretPos = (caretPosition: position) => {
    this.setState({
      ...this.state,
      caretPosition
    })
  }

  setIsCaretHidden = (isCaretHidden: boolean) => {
    this.setState({ ...this.state, isCaretHidden })
  }

  getHtml = () => {
    return this.state.html
  }

  render() {
    const StyledCaret = this.state.StyledCaret
    return (
      <div className='richmon-container'>
        <Toolbar tools={this.state.tools} />
        <Editor
          html={this.getHtml()}
          ref={this.editor}
          setEditorHTML={this.setEditorHTML}
          setCaretPos={this.setCaretPos}
          setIsCaretHidden={this.setIsCaretHidden}
          defaultTextColor={this.props.config.defaultTextColor}
          defaultHgColor={this.props.config.defaultHighlightColor}
          defaultFontSize={this.props.config.defaultFontSize}
        />
        <StyledCaret
          hidden={this.state.isCaretHidden}
          left={this.state.caretPosition.left}
          top={this.state.caretPosition.top}
        />
      </div>
    )
  }
}

export default Richmon
