import React from 'react'
import styled from 'styled-components'

const CaretSpan = styled.span`
  white-space: pre;
  position: absolute;
  pointer-events: none;
  border-right: 1.2px solid black;
  transition: left
    ${(props: { transitionDelay: string }) => props.transitionDelay} ease-in;
`
class Caret extends React.Component<
  {
    hidden: boolean
    top: number
    left: number
    height: string
    transitionDelay: string
  },
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
    this.setState({ ...this.state, hidden: this.state.hidden ? false : true })
  }

  setBlinkInterval() {
    this.blinkInterval = setInterval(() => {
      this.blink()
    }, 550)
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
      }, 100)
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
      <CaretSpan
        style={{
          left: this.props.left + 'px',
          top: this.props.top + 'px',
          height: this.props.height
        }}
        transitionDelay={this.props.transitionDelay}
        hidden={
          this.props.hidden
            ? true
            : this.props.left === 0 && this.props.top === 0
            ? true
            : this.state.hidden
        }
      >
        {'\u200b'}
      </CaretSpan>
    )
  }
}

export default Caret
