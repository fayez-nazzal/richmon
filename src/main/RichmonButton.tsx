import React from 'react'
import { RichmonButtonProps } from './types'
import './richmonUtils'
import { stringToCssObj } from './richmonUtils'

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
      let action = actions[i] as string | { (): any }
      if (typeof actions[i] !== 'string') {
        cb = actions[i] as { (): any }
        // TODO, replace it with regex test
      } else if (/[a-zA-Z]*\(.+\).*/.test(action as string)) {
        action = action as string
        let actionName = action.match(/[a-zA-Z]*(?=\()/)![0]
        let args = action.match(/(?<=\((?:\s*\w+\s*,)*\s*)\w+/g)!
        const extraArgs = action.match(/(?<=\)).*/)![0]
        let canToggle = extraArgs && !extraArgs.includes('!') ? true : false
        console.log(actionName, args, extraArgs)
        if (args && args.length) {
          switch (actionName) {
            case 'textColor':
              cb = () =>
                this.props.setCss(
                  stringToCssObj(`color:${args[0]};`),
                  canToggle
                )
              break
            case 'highlightText':
              cb = () =>
                this.props.setCss(
                  stringToCssObj(`background-color:${args[0]};`),
                  canToggle
                )
              break
            case 'fontSize':
              cb = () =>
                this.props.setCss(
                  `font-size: ${
                    isNaN(+args[0].slice(-1)) ? args[0] : args[0] + 'px'
                  }`,
                  canToggle
                )
              break
            case 'css':
              cb = () => this.props.setCss(stringToCssObj(args[0]), canToggle)
              break
            case 'table':
              break
            default:
              alert('unknown action')
          }
        }
      } else {
        action = action as string
        let actionName = action.match(/[a-zA-Z]*/)![0]
        let extraArgs = action.match(/(?![a-zA-Z]).*/)!
        let canToggle = extraArgs && !extraArgs.includes('!') ? true : false
        switch (actionName) {
          case 'lighter':
            cb = () =>
              this.props.setCss(
                stringToCssObj('font-weight:lighter;'),
                canToggle
              )
            break
          case 'bold':
            cb = () =>
              this.props.setCss(stringToCssObj('font-weight:bold;'), canToggle)
            break
          case 'normal':
            cb = () =>
              this.props.setCss(
                stringToCssObj('font-weight:normal;font-style:normal;'),
                canToggle
              )
            break
          case 'bolder':
            cb = () =>
              this.props.setCss(
                stringToCssObj('font-weight:bolder;'),
                canToggle
              )
            break
          case 'italic':
            cb = () =>
              this.props.setCss(stringToCssObj('font-style:italic;'), canToggle)
            break
          case 'oblique':
            cb = () =>
              this.props.setCss(
                stringToCssObj('font-style:oblique;'),
                canToggle
              )
            break
          default:
            alert('wrong action provided')
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
