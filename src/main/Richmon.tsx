import React from 'react'
import {
  RichmonPropTypes,
  Text,
  RichmonComponentProps,
  position
} from './types'
import { RichmonState } from './RichmonState'
import RichmonButton from './Button'
import Toolbar from './Toolbar'
import Editor from './Editor'
import Caret from './Caret'
import styled from 'styled-components'
import { v4 } from 'uuid'
import List from './List'
import Grid from './Grid'

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

  private editor: any = React.createRef()

  public getComponentProps = (parent = this) => {
    return {
      setCss: (this.editor.current as Editor).setCss,
      insertTable: (this.editor.current as Editor).insertTable,
      insertImage: (this.editor.current as Editor).insertImage,
      deleteSelectedImage: (this.editor.current as Editor).deleteSelectedImage,
      parent
    } as RichmonComponentProps
  }

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
      `
    }
  }

  componentDidMount() {
    const tools = this.constructTools(
      this.props.top as any[],
      this.state.tools,
      this
    )
    this.setState({ ...this.state, tools })
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

  private constructTools = (fromArray: any[], toArray: any[], parent: any) => {
    const toolsProp = fromArray
    const tools = toArray
    for (let i = 0; i < toolsProp.length; i++) {
      const toolProp = toolsProp[i]
      let tool_s: any

      if (typeof toolProp !== 'string') {
        const props = toolProp.props
        switch (toolProp.type.name) {
          case 'RichButton':
            tool_s = (
              <RichmonButton
                key={v4()}
                text={`${props.text}`}
                {...props}
                {...this.getComponentProps(parent)}
              />
            )
            break
          default:
            alert('unknown tool type')
        }
      } else {
        switch (toolProp) {
          case 'BIU':
            tool_s = [
              <RichmonButton
                key={v4()}
                actions={['bold']}
                {...this.getComponentProps(parent)}
              >
                B
              </RichmonButton>,
              <RichmonButton
                key={v4()}
                actions={['italic']}
                {...this.getComponentProps(parent)}
              >
                I
              </RichmonButton>,
              <RichmonButton
                key={v4()}
                actions={['underline']}
                {...this.getComponentProps(parent)}
              >
                U
              </RichmonButton>
            ]
            break
          case 'highlightColors':
          case 'textColors':
            tool_s = (
              <List
                key={v4()}
                css={`
                  padding: 10px 50% 10px 50%;
                `}
                buttonChildren='hello'
                {...this.getComponentProps(parent)}
              >
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    marginBottom: '-6px'
                  }}
                >
                  Basic colors
                </div>
                <hr />
                <Grid
                  rows={5}
                  cols={6}
                  items={[
                    'textColor(black)',
                    'textColor(#5a5a5a)',
                    'textColor(#737373)',
                    'textColor(#8d8d8d)',
                    'textColor(#a6a6a6)',
                    'textColor(#b22222)',
                    'textColor(#ff0000)',
                    'textColor(#ff3b3b)',
                    'textColor(#ff6262)',
                    'textColor(#ff8989)',
                    'textColor(#00b300)',
                    'textColor(#00ff00)',
                    'textColor(#80ff80)',
                    'textColor(#9dff9d)',
                    'textColor(#c4ffc4)',
                    'textColor(#0000b3)',
                    'textColor(#0000ff)',
                    'textColor(#4d4dff)',
                    'textColor(#0080ff)',
                    'textColor(#00ffff)',
                    'textColor(#cccc00)',
                    'textColor(#ffff00)',
                    'textColor(#ffff4e)',
                    'textColor(#ffff89)',
                    'textColor(#ffffb1)',
                    'textColor(#008080)',
                    'textColor(#9370db)',
                    'textColor(#8B4513)',
                    'textColor(#ffa500)',
                    'textColor(#daa520)'
                  ]}
                  parent={parent}
                />
              </List>
            )
            break
          case 'sup':
            tool_s = (
              <RichmonButton
                key={v4()}
                actions={['sup']}
                {...this.getComponentProps(parent)}
              >
                sup
              </RichmonButton>
            )
            break
          case 'delete':
            tool_s = (
              <RichmonButton
                key={v4()}
                actions={['delete']}
                {...this.getComponentProps(parent)}
              ></RichmonButton>
            )
            break
          case 'B':
          case 'bold':
            tool_s = (
              <RichmonButton
                key={v4()}
                actions={['bold']}
                {...this.getComponentProps(parent)}
              >
                B
              </RichmonButton>
            )
            break
          case 'I':
          case 'italic':
            tool_s = (
              <RichmonButton
                key={v4()}
                actions={['italic']}
                {...this.getComponentProps(parent)}
              >
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
                    key={v4()}
                    actions={[`textColor(${toolArgs[0]})`]}
                    {...this.getComponentProps(parent)}
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
