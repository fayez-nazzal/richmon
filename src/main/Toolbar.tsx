import React from 'react'

// TODO: make props types for this component
class Toolbar extends React.Component<any> {
  constructor(props: any) {
    super(props)
  }

  componentDidMount() {
    console.log('toolbar mounted')
  }

  componentDidUpdate() {
    console.log('toolbar updated')
  }

  render() {
    return (
      <div className='toolbar'>
        {this.props.tools.map((tool: JSX.Element, index: number) =>
          React.cloneElement(tool, { key: `tool-${index}` })
        )}
      </div>
    )
  }
}

export default Toolbar
