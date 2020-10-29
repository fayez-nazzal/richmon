import React from 'react'
import List from './List'
import Page from './Page'
import Flex from './Flex'
import Grid from './Grid'
import ColorPickTools from './ColorInputs'
import RichmonButton from './Button'
import { ReactComponent as Down } from '../svgs/down.svg'

interface DropDownListProps {
  parent: any
  action: string
  initialArgs: string
  leftButton: (JSX.Element | string)[] | JSX.Element | string
  basicArgs: string[]
  basicRows: number
  basicCols: number
  basicCss?: string[]
  featuredArgs?: string[]
  featuredCss?: string[]
  featuredRows?: number
  featuredCols?: number
}

interface DropDownListState {
  currentArgs: string
  customActions: JSX.Element[]
}

class DropDownList extends React.PureComponent<
  DropDownListProps,
  DropDownListState
> {
  constructor(props: any) {
    super(props)
    this.state = {
      currentArgs: this.props.initialArgs,
      customActions: []
    }
  }

  addCustomColor = (color: string) => {
    this.setState({
      ...this.state,
      customActions: [
        ...this.state.customActions,
        <RichmonButton
          key={`custom-${this.state.customActions.length}`}
          actions={[`${this.props.action}(${color})`]}
        />
      ]
    })
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
              actions={[`${this.props.action}(${this.state.currentArgs})`]}
              disableAutoStyling
            >
              {this.props.leftButton}
              <div
                style={{
                  width: '86%',
                  height: '3.2px',
                  backgroundColor: this.state.currentArgs,
                  margin: '0 auto',
                  marginTop: '-3px'
                }}
              ></div>
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
          <Page>
            {this.props.featuredArgs &&
            this.props.featuredRows &&
            this.props.featuredCols ? (
              <Grid
                key='grid 2'
                rows={this.props.featuredRows}
                cols={this.props.featuredCols}
                parent={parent}
              >
                {this.props.featuredArgs.map((args, index) => (
                  <RichmonButton
                    key={`featured${index}`}
                    actions={[
                      `${this.props.action}(${args})`,
                      () => {
                        this.setState({
                          ...this.state,
                          currentArgs: args
                        })
                      }
                    ]}
                    css={
                      this.props.featuredCss && this.props.featuredCss[index]
                        ? this.props.featuredCss[index]
                        : ''
                    }
                  />
                ))}
              </Grid>
            ) : (
              ''
            )}
            <div
              style={{
                textAlign: 'center',
                fontSize: '13px',
                marginTop: '6px',
                marginBottom: '-6px'
              }}
            >
              Basic colors
            </div>
            <hr />
            <Grid
              key='grid 1'
              rows={this.props.basicRows}
              cols={this.props.basicCols}
              parent={parent}
            >
              {this.props.basicArgs.map((args, index) => (
                <RichmonButton
                  key={`basic${index}`}
                  actions={[
                    `${this.props.action}(${args})`,
                    () => {
                      this.setState({
                        ...this.state,
                        currentArgs: args
                      })
                    }
                  ]}
                  css={
                    this.props.basicCss && this.props.basicCss[index]
                      ? this.props.basicCss[index]
                      : ''
                  }
                />
              ))}
            </Grid>
            <div
              style={{
                textAlign: 'center',
                fontSize: '13px',
                marginTop: '6px',
                marginBottom: '-6px'
              }}
            >
              Custom colors
            </div>
            <hr />
            <Grid rows={1} cols={6} shouldUpdate>
              {this.state.customActions}
            </Grid>

            <Flex
              items={[
                <RichmonButton actions={['nextPage']} css='margin-top: 8px;'>
                  custom
                </RichmonButton>
              ]}
              parent={parent}
            />
          </Page>
          <Page>
            <ColorPickTools addCustomColor={this.addCustomColor} />
          </Page>
        </List>
      </React.Fragment>
    )
  }
}

export default DropDownList
