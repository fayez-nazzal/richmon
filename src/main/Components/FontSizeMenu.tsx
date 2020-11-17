import React from 'react'
import RichMenu from './RichMenu'
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
      <RichMenu
        buttonChildren={this.state.fontSize}
        buttonCss='background-color:white;'
        buttonWidth={this.props.buttonWidth}
        buttonHeight={this.props.buttonHeight}
      >
        {fontSizes}
      </RichMenu>
    )
  }
}

export default FontSizeMenu
