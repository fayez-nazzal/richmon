import React from 'react'
import Page from './Page'
import Flex from './Flex'
import Grid from './Grid'
import ColorPickTools from './ColorInputs'
import RichmonButton from './Button'
import DropDownList from './DropDownList'

interface ColorListProps {
  parent: any
  action: string
  initialArgs: string
  leftIcon: JSX.Element | string
  basicArgs: string[]
  basicRows: number
  basicCols: number
  basicCss?: string[]
  featuredArgs?: string[]
  featuredCss?: string[]
  featuredRows?: number
  featuredCols?: number
}

interface ColorListState {
  currentArgs: string
  customActions: JSX.Element[]
}

class ColorList extends React.PureComponent<ColorListProps, ColorListState> {
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
        <DropDownList
          leftActions={[`${this.props.action}(${this.state.currentArgs})`]}
          leftChildren={
            <div>
              {this.props.leftIcon}
              <div
                style={{
                  width: '86%',
                  height: '3.2px',
                  backgroundColor: this.state.currentArgs,
                  margin: '0 auto',
                  marginTop: '-3px'
                }}
              ></div>
            </div>
          }
          parent={this.props.parent}
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
        </DropDownList>
      </React.Fragment>
    )
  }
}

export default ColorList
