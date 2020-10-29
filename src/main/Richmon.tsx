import React from 'react'
import { RichmonPropTypes } from './types'
import { RichmonState } from './RichmonState'
import RichmonButton from './Button'
import Toolbar from './Toolbar'
import EditorWrapper from './EditorWrapper'
import isEqual from 'lodash.isequal'
import ColorPicker from './ColorList'
import { ReactComponent as Pen } from '../svgs/pen.svg'

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

  public colorsGridFirstRow: any[] | any
  public editor = React.createRef()

  constructor(props: any) {
    super(props)

    this.state = {
      tools: []
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
              <RichmonButton
                actions={['bold']}
                css='width:28px;height:28px;'
                parent={parent}
              >
                B
              </RichmonButton>,
              <RichmonButton
                actions={['italic']}
                css='width:28px;height:28px;'
                parent={parent}
              >
                I
              </RichmonButton>,
              <RichmonButton
                actions={['underline']}
                css='width:28px;height:28px;'
                parent={parent}
              >
                U
              </RichmonButton>
            ]
            break
          case 'textColors':
            tool_s = (
              <ColorPicker
                action='textColor'
                initialColor='black'
                parent={parent}
                leftButton='A'
              />
            )
            break
          case 'highlightColors':
            tool_s = (
              <ColorPicker
                action='highlight'
                parent={parent}
                initialColor={'yellow'}
                leftButton={<Pen />}
              />
            )
            break
          case 'sup':
            tool_s = (
              <RichmonButton
                actions={['sup']}
                css='width:28px;height:28px;'
                parent={parent}
              >
                sup
              </RichmonButton>
            )
            break
          case 'delete':
            tool_s = (
              <RichmonButton
                actions={['delete']}
                css='width:28px;height:28px;'
                parent={parent}
              ></RichmonButton>
            )
            break
          case 'B':
          case 'bold':
            tool_s = (
              <RichmonButton
                actions={['bold']}
                css='width:28px;height:28px;'
                parent={parent}
              >
                B
              </RichmonButton>
            )
            break
          case 'I':
          case 'italic':
            tool_s = (
              <RichmonButton
                actions={['italic']}
                css='width:28px;height:28px;'
                parent={parent}
              >
                I
              </RichmonButton>
            )
            break
          default:
            let toolName = toolProp.match(/[a-zA-Z]*(?=\()/)![0]
            let toolArgs = toolProp.match(/\(\s*([^)]+?)\s*\)/)![1].split(', ')
            const extraArgs = toolProp.match(/(?<=\)).*/)![0]
            switch (toolName) {
              case 'highlight':
              case 'textColor':
                tool_s = (
                  <RichmonButton
                    actions={[`${toolName}(${toolArgs[0]})${extraArgs}`]}
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

  render() {
    return (
      <div className='richmon-container'>
        <Toolbar tools={this.state.tools} />
        <EditorWrapper
          defaultFontSize={this.props.config.defaultFontSize}
          defaultHighlightColor={this.props.config.defaultHighlightColor}
          defaultTextColor={this.props.config.defaultTextColor}
          editorRef={this.editor}
        />
      </div>
    )
  }
}

export default Richmon
