import React from 'react'
import Menu from './Menu'
import RichOption from './RichOption'

const fontSizes: JSX.Element[] = []

for (let i = 8; i <= 142; i++) {
  fontSizes.push(
    <RichOption
      key={i}
      action={(actions) => {
        actions.setFontSize(`${i}px`)
      }}
      css='padding: auto;'
    >
      {i}
    </RichOption>
  )
}

interface FontSizeMenuProps {
  defaultFontSize: string
  buttonWidth: string
  buttonHeight: string
  buttonCss?: string
  actionButtonCss?: string
  buttonWrapperCss?: string
  css?: string
}

interface FontSizeMenuState {
  fontSize: number
}

class FontSizeMenu extends React.PureComponent<
  FontSizeMenuProps,
  FontSizeMenuState
> {
  private static _instance: FontSizeMenu

  constructor(props: FontSizeMenuProps) {
    super(props)
    this.state = {
      fontSize: parseInt(props.defaultFontSize)
    }
    FontSizeMenu._instance = this
  }

  public static getInstance() {
    return this._instance
  }

  render() {
    return (
      <Menu
        buttonChildren={this.state.fontSize}
        buttonCss={`
          ${this.props.buttonCss}
        `}
        buttonWidth={this.props.buttonWidth}
        buttonHeight={this.props.buttonHeight}
        buttonWrapperCss={this.props.buttonWrapperCss}
        actionButtonCss={this.props.actionButtonCss}
        css={this.props.css}
      >
        {fontSizes}
      </Menu>
    )
  }
}

export default FontSizeMenu
