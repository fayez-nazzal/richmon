import React from 'react'
import './caretStyle.css'

class Caret extends React.Component<
  { className: string; hidden: boolean },
  { hidden: boolean }
> {
  private blinkInterval: any
  private preserveTimeout: any

  constructor(props: any) {
    super(props)
    this.state = {
      hidden: true
    }
  }

  blink() {
    console.log('blink')
    this.setState({ ...this.state, hidden: this.state.hidden ? false : true })
  }

  setBlinkInterval() {
    this.blinkInterval = setInterval(() => {
      this.blink()
    }, 600)
  }

  componentDidMount() {
    this.setBlinkInterval()
  }

  preserveCaret(prevProps: any, prevState: any) {
    if (
      prevState.hidden == this.state.hidden &&
      prevProps.hidden == this.props.hidden &&
      this.blinkInterval
    ) {
      clearInterval(this.blinkInterval)
      this.blinkInterval = null
      if (this.state.hidden === true)
        this.setState({ ...this.state, hidden: false })
      clearTimeout(this.preserveTimeout)
      this.preserveTimeout = setTimeout(() => {
        this.setBlinkInterval()
      }, 300)
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    this.preserveCaret(prevProps, prevState)
  }

  componentWillUnmount() {
    clearInterval(this.blinkInterval)
  }

  render() {
    return (
      <span
        className={this.props.className}
        hidden={this.props.hidden ? true : this.state.hidden}
      >
        {'\u200b'}
      </span>
    )
  }
}

export default Caret
