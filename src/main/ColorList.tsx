import React, { useRef, useState } from 'react'
import Page from './Page'
import ColorPickTools from './ColorInputs'
import RichmonButton from './RichButton'
import DropDownList from './DropDownList'
import Flex from './Flex'
import { Actions } from './EditorActions'
import RichGrid from './RichGrid'
import styles from '../styles.module.css'

interface ColorListProps {
  action: 'textColor' | 'textShadow' | 'textHighlight'
  initialColor: string
  leftIcon?: JSX.Element | string
  basicColors: string[]
  basicRows: number
  basicCols: number
  basicCss?: string[]
  featuredColors?: string[]
  featuredCss?: string[]
  featuredRows?: number
  featuredCols?: number
  hasCustom?: boolean
  customCols?: number
  customRows?: number
  buttonWidth: string
  buttonHeight: string
}

export default (props: ColorListProps) => {
  const [currentColor, setCurrentColor] = useState<string>(props.initialColor)
  const [customColors, setCustomColors] = useState<JSX.Element[]>([])
  const [strokeSize, setStrokeSize] = useState(2)
  const sliderRef = useRef<any>(null)

  const addCustomColor = (color: string) => {
    const customColorsClone = [...customColors]
    if (customColors.length / props.customRows! > props.basicCols)
      customColorsClone.pop()
    customColorsClone.splice(
      0,
      0,
      <RichmonButton
        key={`custom-${customColors.length}`}
        action={(actions) => {
          doAction(actions, color)
        }}
        colorize={color}
        width='auto'
        height='auto'
      />
    )
    setCustomColors([...customColorsClone])
    setCurrentColor(color)
  }

  const doAction = (actions: Actions, color: string) => {
    switch (props.action) {
      case 'textShadow':
        actions.setTextShadow(color, sliderRef.current.value)
        break
      case 'textColor':
        actions.setTextColor(color)
        break
      case 'textHighlight':
        actions.setTextHighlight(color)
        break
    }
  }

  const mapColors = (colors: string[], key: string) => {
    return colors.map((color, index) => {
      return (
        <RichmonButton
          key={`${key}${index}`}
          colorize={color}
          action={(actions: Actions) => {
            doAction(actions, color)
            setCurrentColor(color)
          }}
          css={
            key === 'featured'
              ? props.featuredCss && props.featuredCss[index]
                ? props.featuredCss[index]
                : ''
              : key === 'basic'
              ? props.basicCss && props.basicCss[index]
                ? props.basicCss[index]
                : ''
              : ''
          }
          width='auto'
          height='auto'
        />
      )
    })
  }

  return (
    <React.Fragment>
      <DropDownList
        leftAction={(actions) => {
          doAction(actions, currentColor)
          setCurrentColor(currentColor)
        }}
        buttonWidth={props.buttonWidth}
        buttonHeight={props.buttonHeight}
        leftChildren={
          <div>
            {props.leftIcon}
            {!props.leftIcon && props.action === 'textShadow' ? (
              <span
                style={{
                  textShadow: `${currentColor} 0px 0px ${strokeSize}px`,
                  fontSize: '13px',
                  position: 'relative'
                }}
              >
                S
              </span>
            ) : (
              <div
                style={{
                  width: '60%',
                  height: '3.2px',
                  backgroundColor: currentColor,
                  margin: '0 auto',
                  marginTop: '-2.6px'
                }}
              ></div>
            )}
          </div>
        }
      >
        <Page>
          {props.action === 'textShadow' ? (
            <Flex height='23px'>
              <input
                type='range'
                min='0'
                max='5'
                className={styles.slider}
                value={strokeSize}
                step='1'
                onChange={(e: any) => {
                  setStrokeSize(e.target.value)
                }}
                ref={sliderRef}
              />
              <span
                style={{
                  width: '45px',
                  paddingLeft: '4px',
                  wordSpacing: '-1px'
                }}
              >
                {strokeSize + ' px'}
              </span>
            </Flex>
          ) : (
            ''
          )}

          {props.featuredColors && props.featuredRows && props.featuredCols ? (
            <RichGrid
              key='grid 2'
              rows={props.featuredRows}
              cols={props.featuredCols}
            >
              {mapColors(props.featuredColors, 'featured')}
            </RichGrid>
          ) : (
            ''
          )}
          <div
            style={{
              textAlign: 'center',
              fontSize: '13px',
              marginTop: '6px',
              marginBottom: '-6px',
              userSelect: 'none'
            }}
          >
            Basic colors
          </div>
          <hr />
          <RichGrid
            key='grid 1'
            rows={props.basicRows}
            cols={props.basicCols}
            css='margin-top:6px;'
          >
            {mapColors(props.basicColors, 'basic')}
          </RichGrid>
          <div
            style={{
              textAlign: 'center',
              fontSize: '13px',
              marginTop: '6px',
              marginBottom: '-6px',
              userSelect: 'none'
            }}
          >
            Custom colors
          </div>
          <hr />
          {props.hasCustom ? (
            <RichGrid
              rows={props.customRows!}
              cols={props.customCols!}
              shouldUpdate
            >
              {customColors}
            </RichGrid>
          ) : (
            ''
          )}
          {props.hasCustom ? (
            <RichmonButton
              action={(actions) => {
                actions.nextPage()
              }}
              css='display:block;margin: 0 auto;text-align: center;margin-top: 8px;position:relative;'
              pageButton
              width='auto'
              height='auto'
            >
              custom
            </RichmonButton>
          ) : (
            ''
          )}
        </Page>
        {props.hasCustom ? (
          <Page>
            <ColorPickTools
              addCustomColor={addCustomColor}
              doAction={doAction}
            />
          </Page>
        ) : (
          ''
        )}
      </DropDownList>
    </React.Fragment>
  )
}
