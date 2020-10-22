import React from 'react'
import {
  RichmonPropTypes,
  Text,
  RichmonComponentProps,
  position
} from './types'
import { RichmonState } from './RichmonState'
import RichmonButton from './RichmonButton'
import RichmonList from './RichmonList'
import Toolbar from './Toolbar'
import Editor from './Editor'
import Caret from './Caret'
import styled from 'styled-components'

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

  private tools: any[] = []
  private imageTools: any[] = []
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
        border-right: 1.2px solid black;
        transition: left 65ms ease-in;
      `
    }
  }

  componentDidMount() {
    this.constructTools(this.props.top as any[], this.tools)
    this.constructTools(this.props.config.imageTools, this.imageTools)
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
      setCss: (this.editor.current as Editor).setCss,
      insertTable: (this.editor.current as Editor).insertTable,
      insertImage: (this.editor.current as Editor).insertImage,
      deleteSelectedImage: (this.editor.current as Editor).deleteSelectedImage
    } as RichmonComponentProps
  }

  private constructTools = (fromArray: any[], toArray: any[]) => {
    const toolsProp = fromArray
    for (let i = 0; i < toolsProp.length; i++) {
      const toolProp = toolsProp[i]
      let tool_s: any

      if (typeof toolProp !== 'string') {
        const props = toolProp.props
        switch (toolProp.type.name) {
          case 'RichButton':
            tool_s = (
              <RichmonButton
                key={`${toArray.length}`}
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
          case 'BIU':
            tool_s = [
              <RichmonButton
                key={`${this.tools.length}`}
                text='B'
                actions={['bold']}
                {...this.getComponentProps()}
              />,
              <RichmonButton
                key={`${this.tools.length + 1}`}
                text='I'
                actions={['italic']}
                {...this.getComponentProps()}
              />,
              <RichmonButton
                key={`${this.tools.length + 2}`}
                text='U'
                actions={['underline']}
                {...this.getComponentProps()}
              />
            ]
            break
          case 'textColors':
            tool_s = (
              <RichmonGrid
                key={`${toArray.length}`}
                text='colors'
                cols='5'
                rows='5'
                tools={[
                  <RichmonButton
                    key={`${this.tools.length + 2}`}
                    text=''
                    actions={['textColor(black)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 2}`}
                    text=''
                    actions={['textColor(#7a7a7a)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 2}`}
                    text=''
                    actions={['textColor(#969696)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#bdbdbd)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#f08080)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#ff9999)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#ff7a7a)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#32cd32)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#008000)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#98fb98)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#d0f0c0)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#0000cd)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#4169e1)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#1e90ff)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#00bfff)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#ffd700)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#ffa500)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#ffff31)']}
                    {...this.getComponentProps()}
                  />,
                  <RichmonButton
                    key={`${this.tools.length + 1}`}
                    text=''
                    actions={['textColor(#dfff00)']}
                    {...this.getComponentProps()}
                  />
                ]}
              />
            )
            break
          case 'sup':
            tool_s = (
              <RichmonButton
                key={`${toArray.length}`}
                text='sup'
                actions={['sup']}
                {...this.getComponentProps()}
              />
            )
            break
          case 'delete':
            tool_s = (
              <RichmonButton
                key={`${toArray.length}`}
                text='X'
                actions={['delete']}
                {...this.getComponentProps()}
              />
            )
            break
          case 'bold':
            tool_s = (
              <RichmonButton
                key={`${this.tools.length}`}
                text='B'
                actions={['bold']}
                {...this.getComponentProps()}
              />
            )
            break
          case 'italic':
            tool_s = (
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
      if (tool_s.length) for (let tool of tool_s) toArray.push(tool)
      else toArray.push(tool_s)
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
