import React from 'react'
import {
  RichmonPropTypes,
  TabsStruct,
  Text,
  RichmonComponentProps,
  position
} from './types'
import { RichmonState } from './RichmonState'
import RichmonButton from './RichmonButton'
import Toolbar from './Toolbar'
import Editor from './Editor'
import Caret from './Caret'
import styled from 'styled-components'

const defaultProps = {
  config: {
    defaultTheme: 'light',
    defaultTextColor: 'black',
    defaultFontSize: '14px',
    defaultHighlightColor: 'transparent'
  }
}

class Richmon extends React.Component<RichmonPropTypes, RichmonState> {
  public static defaultProps = defaultProps

  private tools: any[] = []
  private editor: any = React.createRef()

  constructor(props: any) {
    super(props)

    this.state = {
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
        border-right: 1.4px solid blue;
        transition: left 65ms ease-in;
      `
    }
  }

  componentDidMount() {
    this.constructTools()
  }

  isTabStruct(object: any): object is TabsStruct {
    return 'defaultTab' in object
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

  public getComponentProps = () => {
    return {
      setTextColor: (this.editor.current as Editor).setTextColor,
      setTextHighlight: (this.editor.current as Editor).setTextHighlight,
      setFontSize: (this.editor.current as Editor).setFontSize,
      setBold: this.setBold,
      setItalic: this.setItalic,
      setCss: (this.editor.current as Editor).setCss
    } as RichmonComponentProps
  }

  private constructTools = () => {
    if (this.isTabStruct(this.props.struct))
      alert('tab struct, not implemented')
    else {
      const toolsProp = this.props.struct.tools
      for (let i = 0; i < toolsProp.length; i++) {
        const toolProp = toolsProp[i]
        let tool

        if (typeof toolProp !== 'string') {
          const props = toolProp.props
          switch (toolProp.type.name) {
            case 'RichButton':
              tool = (
                <RichmonButton
                  key={`${this.tools.length}`}
                  text={`${props.text}`}
                  {...props}
                  {...this.getComponentProps()}
                />
              )
              break
            default:
              alert('unknown tool type')
          }
        } else {
          switch (toolProp) {
            case 'bold':
              tool = (
                <RichmonButton
                  key={`${this.tools.length}`}
                  text='B'
                  actions={['bold']}
                  {...this.getComponentProps()}
                />
              )
              break
            case 'italic':
              tool = (
                <RichmonButton
                  key={`${this.tools.length}`}
                  text='i'
                  actions={['italic']}
                  {...this.getComponentProps()}
                />
              )
              break
          }
        }
        this.tools.push(tool)
      }
    }
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
        <Toolbar tools={this.tools} />
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
