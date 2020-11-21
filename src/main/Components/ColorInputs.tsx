import React, { MutableRefObject, useRef, useState } from 'react'
import styled from 'styled-components'
import RichButton from './RichButton'
import { ReactComponent as Back } from '../../svgs/back.svg'
import RichMenu from './RichMenu'
import { ActionTypes } from '../../Actions'
import { SliderPicker } from 'react-color'

const Input = styled.input`
  caret-color: black;
  flex: 1 1 auto;
  width: 20%;
  color: #222222;
  border-radius: 0.2rem;
  border: none;
  border: 1px solid #aaaaaa;
  &:hover {
    outline: none;
    border-color: #555555;
  }
  &:focus {
    outline: none;
    border-color: teal;
  }
`

const InputsFlex = styled.div`
  display: flex;
  width: 135px;
  justify-content: center;
  height: 23px;
  margin-top: 10px;
  user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
`

const Label = styled.label`
  height: 23px;
  line-height: 23px;
  padding: 0;
  margin: 0 2px;
  font-size: 14px;
`

const StyledBack = styled(Back)`
  position: absolute;
  top: 4px;
  left: 3.5px;
  &:hover {
    fill: teal;
  }
`

export default (props: {
  parent?: any
  addCustomColor: any
  doAction: { (actions: ActionTypes, color: string): void }
}) => {
  const [hex, setHex] = useState('#000000')
  const [r, setR] = useState(0)
  const [g, setG] = useState(0)
  const [b, setB] = useState(0)
  const rRef = useRef() as MutableRefObject<HTMLInputElement>
  const gRef = useRef() as MutableRefObject<HTMLInputElement>
  const bRef = useRef() as MutableRefObject<HTMLInputElement>

  const handleColorChange = ({ hex }: { hex: string }) => {
    setColor(hex)
  }

  const handleHexChange = (e: any) => {
    if (!/^(?:[A-Fa-f0-9]*)$/.test(e.target.value)) return
    setColor('#' + e.target.value)
  }

  const setColor = (hex: string) => {
    setHex(hex)
    setRGB(hex)
  }

  const setRGB = (hex: string) => {
    const rgb = hexToRGB(hex)
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

    setR(r)
    setG(g)
    setB(b)
    setHex('#' + rgbToHex(r, g, b))
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

  const pickTextColorBasedOnColor = (lightColor: string, darkColor: string) => {
    const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)
    return brightness > 125 ? darkColor : lightColor
  }

  const chooseColorByBrighteness = () => {
    return pickTextColorBasedOnColor('#C0C0C0', 'black')
  }

  return (
    <React.Fragment>
      <StyledBack
        onClick={() => {
          RichMenu.getOpened().previousPage()
        }}
      />
      <SliderPicker
        color={hex}
        onChange={handleColorChange}
        styles={{
          default: {
            hue: {
              marginTop: '5px',
              marginBottom: '-10px'
            }
          }
        }}
      />
      <InputsFlex>
        <Label>#</Label>
        <Input
          name='test'
          style={{ display: 'inline-block' }}
          onChange={handleHexChange}
          value={hex.slice(1)}
          autoComplete='off'
          maxLength={6}
        />
      </InputsFlex>
      <InputsFlex>
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
      </InputsFlex>
      <InputsFlex style={{ height: 'auto' }}>
        <RichButton
          action={(actions) => {
            props.addCustomColor(hex)
            props.doAction(actions, hex)
          }}
          css={`
            color: ${chooseColorByBrighteness()};
            border: 1px solid ${chooseColorByBrighteness()};
            margin: 4px auto;
          `}
          colorize={hex}
          width='auto'
          height='auto'
        >
          Select
        </RichButton>
      </InputsFlex>
    </React.Fragment>
  )
}
