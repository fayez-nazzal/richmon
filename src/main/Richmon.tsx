import React from 'react'
import RichmonButton from './Button'
import Toolbar from './Top'
import EditorWrapper from './EditorWrapper'
import isEqual from 'lodash.isequal'
import { ReactComponent as Pen } from '../svgs/pen.svg'
import ColorList from './ColorList'
import '../styles.css'
import styled from 'styled-components'
import { config } from './config'
import FontSizeMenu from './FontSizeMenu'

interface RichmonPropTypes {
  defaultTextColor: string
  defaultHighlightColor: string
  defaultFontSize: string
  height: string
  width: string
  top: (JSX.Element | string)[]
  onChange: { (html: string): void }
  content: string
}

type RichmonState = {
  tools: JSX.Element[]
}

class Richmon extends React.Component<RichmonPropTypes, RichmonState> {
  public static defaultProps: Partial<RichmonPropTypes> = {
    defaultTextColor: 'black',
    defaultFontSize: '14px',
    defaultHighlightColor: 'transparent',
    width: '400px',
    height: '400px'
  }

  public editor = React.createRef()

  constructor(props: any) {
    super(props)

    this.state = {
      tools: []
    }
  }

  updateTools = () => {
    const tools = this.constructTools(this.props.top as any[])
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
            console.log(toolProp)
            tool_s = <RichmonButton {...props}>{props.children}</RichmonButton>
            break
          default:
            tool_s = toolProp
        }
      } else {
        switch (toolProp) {
          case 'BIU':
            tool_s = [
              <RichmonButton
                action={(actions) => {
                  actions.setBold()
                }}
                css='width:28px;height:28px;'
              >
                B
              </RichmonButton>,
              <RichmonButton
                action={(actions) => {
                  actions.setItalic()
                }}
                css='width:28px;height:28px;'
              >
                I
              </RichmonButton>,
              <RichmonButton
                action={(actions) => {
                  actions.setUndeerline()
                }}
                css='width:28px;height:28px;'
              >
                U
              </RichmonButton>
            ]
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
              />
            )
            break
          case 'textHighlight':
            tool_s = (
              <ColorList
                action='textHighlight'
                initialColor='#f8ff00'
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
              />
            )
            break
          case 'fontSize':
            tool_s = (
              <FontSizeMenu defaultFontSize={this.props.defaultFontSize} />
            )
            break
          case 'B':
          case 'bold':
            tool_s = (
              <RichmonButton
                action={(actions) => {
                  actions.setBold()
                }}
                css='width:28px;height:28px;'
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
                css='width:28px;height:28px;'
              >
                I
              </RichmonButton>
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

  Div = styled.div`
    -webkit-box-shadow: 0px 0px 3px 2px #888888;
    box-shadow: 0px 0px 3px 2px #888888;
    width: ${this.props.width};
    height: ${this.props.height};
  `
  render() {
    const Div = this.Div
    return (
      <Div className='richmon-container'>
        <Toolbar tools={this.state.tools} width={this.props.width} />
        <EditorWrapper
          defaultFontSize={this.props.defaultFontSize}
          defaultHighlightColor={this.props.defaultHighlightColor}
          defaultTextColor={this.props.defaultTextColor}
          editorRef={this.editor}
          onChange={this.props.onChange}
          content={this.props.content}
        />
      </Div>
    )
  }
}

export default Richmon
