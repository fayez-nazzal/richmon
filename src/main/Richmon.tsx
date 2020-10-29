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

  public editor = React.createRef()
  private defaultFeaturedColorArgs = [
    '#00000000',
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
  ]
  private defaultFeaturedColorCss = [
    `background-color: #ffffff;
     background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='9' viewBox='0 0 8 8'%3E%3Cg fill='%23ededed' fill-opacity='1'%3E%3Cpath fill-rule='evenodd' d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/%3E%3C/g%3E%3C/svg%3E");`
  ]
  private defaultBasicColorArgs = [
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
  ]

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
            alert('rich button')
            console.log(toolProp)
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
                initialArgs='#000000'
                parent={parent}
                leftButton='A'
                basicArgs={this.defaultBasicColorArgs}
                basicRows={5}
                basicCols={6}
                featuredArgs={this.defaultFeaturedColorArgs}
                featuredRows={2}
                featuredCols={6}
                featuredCss={this.defaultFeaturedColorCss}
              />
            )
            break
          case 'highlightColors':
            tool_s = (
              <ColorPicker
                action='highlight'
                initialArgs='#ffff00'
                parent={parent}
                leftButton={<Pen />}
                basicArgs={this.defaultBasicColorArgs}
                basicRows={5}
                basicCols={6}
                featuredArgs={this.defaultFeaturedColorArgs}
                featuredRows={2}
                featuredCols={6}
                featuredCss={this.defaultFeaturedColorCss}
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
