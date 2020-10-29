import React from 'react'
import List from './List'
import RichmonButton from './Button'
import { ReactComponent as Down } from '../svgs/down.svg'

interface DropDownListProps {
  parent: any
  left: (JSX.Element | string)[] | JSX.Element | string
  leftActions: any[]
}

class DropDownList extends React.PureComponent<DropDownListProps> {
  constructor(props: any) {
    super(props)
  }

  render() {
    return (
      <React.Fragment>
        <List
          css='padding: 10px;'
          buttonChildren={<Down style={{ marginBottom: '-2px' }} />}
          leftButton={
            <RichmonButton
              css='font-weight: normal;padding-left: 4px;padding-right:2px;border-right:none;width: 24px;height:28px;&:hover{outline:none;}'
              actions={this.props.leftActions}
              disableAutoStyling
            >
              {this.props.left}
            </RichmonButton>
          }
          buttonCss={`
        padding: 0 3px;
        border-left: none;
        width: auto;
        height: 28px;
        &:hover {
          outline: none;
        }
        `}
          buttonWrapperCss={`
          &:hover {
            outline: 2px solid #e3e3e3;
            z-index: 1000;
            position: relative;
          }
        `}
          parent={this.props.parent}
          width='160px'
        >
          {this.props.children}
        </List>
      </React.Fragment>
    )
  }
}

export default DropDownList
