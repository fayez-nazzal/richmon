import React from 'react'
import { RichmonButtonProps } from './types'
import './richmonUtils'
import { stringToCssObj } from './richmonUtils'
import styled from 'styled-components'

class RichmonButton extends React.Component<
  RichmonButtonProps,
  { extraStyles: string }
> {
  public clickCbs: { (): void }[] = []

  constructor(props: any) {
    super(props)
    this.state = {
      extraStyles: ''
    }
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
        let args = action.match(/\(\s*([^)]+?)\s*\)/)![1].split(', ')
        const extraArgs = action.match(/(?<=\)).*/)![0]
        let canToggle = extraArgs && !extraArgs.includes('!') ? true : false
        console.log(actionName, args, extraArgs)
        if (args && args.length) {
          switch (actionName) {
            case 'textColor':
              this.setState({
                ...this.state,
                extraStyles: `padding: 6.4px;border:none;background-color:${args[0]}`
              })
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
              let rows: number = 0
              let cols: number = 0
              let css: string = ''
              if (args.length === 1) css = args[0]
              else {
                rows = parseInt(args[0])
                cols = parseInt(args[1])
                css = args[2]
              }
              if (!rows) rows = parseInt(prompt('set row')!)
              if (!cols) cols = parseInt(prompt('set cols')!)
              cb = () => this.props.insertTable(rows, cols, css)
              break
            case 'img':
              if (args[0].includes('http')) {
                const str = action.substring(
                  action.indexOf('(') + 1,
                  action.indexOf(')')
                )
                cb = () => this.props.insertImage(str)
              }
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
          case 'delete':
            cb = () => this.props.deleteSelectedImage()
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
          case 'underline':
            cb = () =>
              this.props.setCss(
                stringToCssObj('text-decoration:underline;'),
                canToggle
              )
            break
          case 'super':
            cb = () =>
              this.props.setCss(
                stringToCssObj('vertical-align:super;font-size:12px;'),
                canToggle
              )
            break
          default:
            alert(actionName)
            alert('wrong action provided')
        }
      }
      if (cb) this.clickCbs.push(cb)
    }
  }
  render() {
    const Btn = styled.button`
      ${this.state.extraStyles};
      ${this.props.css};
    `
    return (
      <Btn
        onClick={this.onCLick}
        onMouseDown={(e) => e.preventDefault()}
        onMouseUp={(e) => e.preventDefault()}
        className={this.props.className}
        style={this.props.style}
      >
        {this.props.children}
      </Btn>
    )
  }
}

export default RichmonButton
