import React from 'react'
import { RichmonListProps } from './types'
import './richmonUtils'

class RichmonList extends React.Component<RichmonListProps> {
  private showContents = false

  constructor(props: any) {
    super(props)
  }

  render() {
    return (
      <div>
        <button
          onClick={() => {
            this.showContents = true
          }}
          onMouseDown={(e) => e.preventDefault()}
          onMouseUp={(e) => e.preventDefault()}
        >
          {this.props.text}
        </button>
        <div hidden={this.showContents}>{this.props.tools}</div>
      </div>
    )
  }
}

export default RichmonList
