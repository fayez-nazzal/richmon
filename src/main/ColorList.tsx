import React, { useState } from 'react'
import RichButton from '../Components/RichButton'
import List from './List'
import Page from './Page'
import Flex from './Flex'
import Grid from './Grid'
import ColorPickTools from './ColorInputs'
import RichmonButton from './Button'
import { ReactComponent as Down } from '../svgs/down.svg'

export default (_props: {
  parent: any
  action: string
  initialColor: string
  leftButton: (JSX.Element | string)[] | JSX.Element | string
}) => {
  const [customColors, setCustomColors] = useState<(string | JSX.Element)[]>([])
  const [currentColor, setCurrentColor] = useState(_props.initialColor)

  const addCustomColor = (color: string) => {
    const customColorsClone = [...customColors]
    if (customColors.length > 6) customColorsClone.splice(0, 1)
    customColorsClone.push(
      <RichmonButton
        actions={[
          _props.action + `textColor(${color})c`,
          () => {
            setCurrentColor(`textColor(${color})c`)
          }
        ]}
      />
    )
    setCustomColors(customColorsClone)
  }

  return (
    <React.Fragment>
      <List
        css='padding: 10px;'
        buttonChildren={<Down style={{ marginBottom: '-2px' }} />}
        leftButton={
          <RichmonButton
            css='font-weight: normal;padding-left: 4px;padding-right:2px;border-right:none;width: 24px;height:28px;&:hover{outline:none;}'
            actions={[`${_props.action}(${currentColor})`]}
          >
            {_props.leftButton}
            <div
              style={{
                width: '86%',
                height: '3.2px',
                backgroundColor: currentColor,
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
        parent={_props.parent}
        width='160px'
      >
        <Page>
          <Grid
            rows={2}
            cols={6}
            items={[
              <RichmonButton
                actions={[
                  _props.action + '(#00000000)c',
                  () => {
                    setCurrentColor('#00000000')
                  }
                ]}
                css={`
                  background-color: #ffffff;
                  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='9' viewBox='0 0 8 8'%3E%3Cg fill='%23ededed' fill-opacity='1'%3E%3Cpath fill-rule='evenodd' d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/%3E%3C/g%3E%3C/svg%3E");
                `}
              ></RichmonButton>,
              <RichmonButton
                actions={[
                  _props.action + '(#00bcd4)c',
                  () => {
                    setCurrentColor('#00bcd4')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#b2ebf2)c',
                  () => {
                    setCurrentColor('#b2ebf2')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#a09d9c)c',
                  () => {
                    setCurrentColor('#a09d9c')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#d9adad)c',
                  () => {
                    setCurrentColor('#d9adad')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#faf3dd)c',
                  () => {
                    setCurrentColor('#faf3dd')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#d789d7)c',
                  () => {
                    setCurrentColor('#d789d7')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#bbd196)c',
                  () => {
                    setCurrentColor('#bbd196')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#fcf876)c',
                  () => {
                    setCurrentColor('#fcf876')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#ee6f57)c',
                  () => {
                    setCurrentColor('#ee6f57')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#f0daa4)c',
                  () => {
                    setCurrentColor('#f0daa4')
                  }
                ]}
              />,

              <RichmonButton
                actions={[
                  _props.action + '(#eaac9d)c',
                  () => {
                    setCurrentColor('#eaac9d')
                  }
                ]}
              />
            ]}
            parent={parent}
          />
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
            rows={5}
            cols={6}
            items={[
              <RichmonButton
                actions={[
                  _props.action + '(black)c',
                  () => {
                    setCurrentColor('black')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#5a5a5a)c',
                  () => {
                    setCurrentColor('#5a5a5a')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#737373)c',
                  () => {
                    setCurrentColor('#737373')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#8d8d8d)c',
                  () => {
                    setCurrentColor('#8d8d8d')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#a6a6a6)c',
                  () => {
                    setCurrentColor('#a6a6a6')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#b22222)c',
                  () => {
                    setCurrentColor('#b22222')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#ff0000)c',
                  () => {
                    setCurrentColor('#ff0000')
                  }
                ]}
              />,

              <RichmonButton
                actions={[
                  _props.action + '(#ff3b3b)c',
                  () => {
                    setCurrentColor('#ff3b3b')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#ff6262)c',
                  () => {
                    setCurrentColor('#ff6262')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#ff8989)c',
                  () => {
                    setCurrentColor('#ff8989')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#00b300)c',
                  () => {
                    setCurrentColor('#00b300')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#00ff00)c',
                  () => {
                    setCurrentColor('#00ff00')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#80ff80)c',
                  () => {
                    setCurrentColor('#80ff80')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#9dff9d)c',
                  () => {
                    setCurrentColor('#9dff9d')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#c4ffc4)c',
                  () => {
                    setCurrentColor('#c4ffc4')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#0000b3)c',
                  () => {
                    setCurrentColor('#0000b3')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#0000ff)c',
                  () => {
                    setCurrentColor('#0000ff')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#4d4dff)c',
                  () => {
                    setCurrentColor('#4d4dff')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#0080ff)c',
                  () => {
                    setCurrentColor('#0080ff')
                  }
                ]}
              />,

              <RichmonButton
                actions={[
                  _props.action + '(#00ffff)c',
                  () => {
                    setCurrentColor('#00ffff')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#cccc00)c',
                  () => {
                    setCurrentColor('#cccc00')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#ffff00)c',
                  () => {
                    setCurrentColor('#ffff00')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#ffff4e)c',
                  () => {
                    setCurrentColor('#ffff4e')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#ffff89)c',
                  () => {
                    setCurrentColor('#ffff89')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#ffffb1)c',
                  () => {
                    setCurrentColor('#ffffb1')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#008080)c',
                  () => {
                    setCurrentColor('#008080')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#9370db)c',
                  () => {
                    setCurrentColor('#9370db')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#8B4513)c',
                  () => {
                    setCurrentColor('#8B4513')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#ffa500)c',
                  () => {
                    setCurrentColor('#ffa500')
                  }
                ]}
              />,
              <RichmonButton
                actions={[
                  _props.action + '(#daa520)c',
                  () => {
                    setCurrentColor('#daa520')
                  }
                ]}
              />
            ]}
            parent={parent}
          />
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
          <Grid rows={1} cols={6} items={customColors} parent={parent} />
          <Flex
            items={[
              <RichButton actions={['nextPage']} css='margin-top: 8px;'>
                custom
              </RichButton>
            ]}
            parent={parent}
          />
        </Page>
        <Page>
          <ColorPickTools addCustomColor={addCustomColor} />
        </Page>
      </List>
    </React.Fragment>
  )
}
