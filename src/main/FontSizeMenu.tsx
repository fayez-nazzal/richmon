import React from 'react'
import RichMenu from './RichMenu'
import RichOption from './RichOption'

const fontSizes: JSX.Element[] = []

for (let i = 6; i <= 142; i++) {
  fontSizes.push(
    <RichOption
      action={(actions) => {
        actions.setFontSize(`${i}px`)
      }}
      css='padding: 1px 15px;'
    >
      {i}
    </RichOption>
  )
}

interface FontSizeMenuProps {
  defaultFontSize: string
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
      >
        {fontSizes}
      </RichMenu>
    )
  }
}

export default FontSizeMenu
