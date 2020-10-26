import React from 'react'

// TODO: make props types for this component
class Toolbar extends React.Component<any> {
  constructor(props: any) {
    super(props)
  }
  componentDidUpdate() {
    console.log('toolbar updated')
  }

  render() {
    return <div className='toolbar'>{this.props.tools}</div>
  }
}

export default Toolbar
