import React from 'react'
import { RichmonButtonProps } from './types'

class RichmonButton extends React.Component<RichmonButtonProps> {
  public clickCbs: { (): void }[] = []

  constructor(props: any) {
    super(props)
  }

  onCLick = (e: React.MouseEvent) => {
    for (let i = 0; i < this.clickCbs.length; i++) {
      this.clickCbs[i]()
    }
    e.preventDefault()
  }

  componentDidMount() {
    const actions = this.props.actions

    for (let i = 0; i < actions.length; i++) {
      let cb
      if (typeof actions[i] !== 'string') {
        cb = actions[i] as { (): any }
      } else {
        const action = actions[i] as string
        const argsStart = action.indexOf('(')
        const argsEnd = action.indexOf(')', argsStart)
        const optsStart = action.indexOf('{')
        const optsEnd = action.indexOf('{', argsStart)
        const actionName = action
          .trim()
          .substring(0, argsStart > -1 ? argsStart : action.length)
        if (argsStart !== -1 && argsEnd !== -1) {
          const arg = action.substring(argsStart + 1, argsEnd)
          switch (actionName) {
            case 'textColor':
              cb = () => this.props.setTextColor(arg)
              break
            case 'highlightText':
              cb = () => this.props.setTextHighlight(arg)
              break
            case 'fontSize':
              cb = () =>
                this.props.setFontSize(isNaN(+arg.slice(-1)) ? arg : arg + 'px')
              break
            case 'css':
              cb = () => this.props.setCss(arg)
              break
            default:
              alert('unknown action')
          }
        } else if (optsStart !== -1 && optsEnd !== -1) {
          // const opts = actions[i]
          //   .substring(valStart + 1, valEnd)
          //   .split(',')
          //   .filter(Boolean)
          alert('unimplemented action')
        } else {
          switch (actionName) {
            case 'bold':
              cb = () => this.props.setBold()
              break
            case 'italic':
              cb = () => this.props.setItalic()
              break
            default:
              alert('wrong action provided')
          }
        }
      }
      if (cb) this.clickCbs.push(cb)
    }
  }
  render() {
    return (
      <button
        onClick={this.onCLick}
        onMouseDown={(e) => e.preventDefault()}
        onMouseUp={(e) => e.preventDefault()}
      >
        {this.props.text}
      </button>
    )
  }
}

export default RichmonButton
