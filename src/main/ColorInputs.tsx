import React, { MutableRefObject, useRef, useState } from 'react'
import styled from 'styled-components'
import RichmonButton from './Button'

const Input = styled.input`
  caret-color: black;
  flex: 1 1 auto;
  width: 20%;
`

const Label = styled.label`
  height: 23px;
  line-height: 23px;
  padding: 0;
  margin: 0 2px;
`

const FlexDiv = styled.div`
  display: flex;
  width: 160px;
  justify-content: center;
  height: 23px;
`

export default (props: { parent?: any; addCustomColor: any }) => {
  const [hex, setHEx] = useState('000000')
  const [r, setR] = useState(0)
  const [g, setG] = useState(0)
  const [b, setB] = useState(0)
  const rRef = useRef() as MutableRefObject<HTMLInputElement>
  const gRef = useRef() as MutableRefObject<HTMLInputElement>
  const bRef = useRef() as MutableRefObject<HTMLInputElement>

  const handleHexChange = (e: any) => {
    if (!/^(?:[A-Fa-f0-9]*)$/.test(e.target.value)) return

    setHEx(e.target.value)
    const rgb = hexToRGB('#' + e.target.value)
    setR(isNaN(rgb[0]) ? 0 : rgb[0])
    setG(isNaN(rgb[1]) ? 0 : rgb[1])
    setB(isNaN(rgb[2]) ? 0 : rgb[2])
  }

  const handleRGBChange = () => {
    let r = parseInt(rRef.current!.value)
    let g = parseInt(gRef.current!.value)
    let b = parseInt(bRef.current!.value)

    if (r > 255 || g > 255 || b > 255) return

    r = isNaN(r) ? 0 : r
    g = isNaN(g) ? 0 : g
    b = isNaN(b) ? 0 : b

    setHEx(rgbToHex(r, g, b))
    setR(r)
    setG(g)
    setB(b)
  }

  const rgbToHex = (r: number, g: number, b: number) =>
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')

  const hexToRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return [r, g, b]
  }

  const pickTextColorBasedOnColor = (
    bgColor: string,
    lightColor: string,
    darkColor: string
  ) => {
    var color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor
    var r = parseInt(color.substring(0, 2), 16) // hexToR
    var g = parseInt(color.substring(2, 4), 16) // hexToG
    var b = parseInt(color.substring(4, 6), 16) // hexToB
    var uicolors = [r / 255, g / 255, b / 255]
    var c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92
      }
      return Math.pow((col + 0.055) / 1.055, 2.4)
    })
    var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    return L > 0.179 ? darkColor : lightColor
  }

  const chooseColorByBrighteness = () => {
    return pickTextColorBasedOnColor(hex, '#C0C0C0', 'black')
  }

  return (
    <React.Fragment>
      <FlexDiv>
        <Label>#</Label>
        <Input
          name='test'
          style={{ display: 'inline-block' }}
          onChange={handleHexChange}
          value={hex}
          autoComplete='off'
          maxLength={6}
        />
      </FlexDiv>
      <FlexDiv style={{ marginTop: '10px' }}>
        <Label>R</Label>
        <Input
          autoComplete='off'
          onChange={handleRGBChange}
          value={r}
          ref={rRef}
        />
        <Label>G</Label>
        <Input
          autoComplete='off'
          onChange={handleRGBChange}
          value={g}
          ref={gRef}
        />
        <Label>B</Label>
        <Input
          autoComplete='off'
          onChange={handleRGBChange}
          value={b}
          ref={bRef}
        />
      </FlexDiv>
      <FlexDiv style={{ height: 'auto' }}>
        <RichmonButton
          parent={props.parent}
          actions={[
            `textColor(${hex === '' ? '#ffffff' : '#' + hex})c`,
            () => {
              props.addCustomColor(hex === '' ? '#ffffff' : '#' + hex)
            }
          ]}
          css={`
            color: ${chooseColorByBrighteness()};
            border: 1px solid ${chooseColorByBrighteness()};
            margin: 4px auto;
          `}
        >
          Select
        </RichmonButton>
      </FlexDiv>
    </React.Fragment>
  )
}
