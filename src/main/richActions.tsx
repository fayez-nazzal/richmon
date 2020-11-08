import Editor from './Editor'
import FontSizeMenu from './FontSizeMenu'
import List from './List'
import { stringToCssObj } from './richmonUtils'

export interface Actions {
  setFontSize: { (fontSize: string): void }
  setCss: { (css: string, canToggle?: boolean): void }
  setTextShadow: { (color: string, length: string, canToggle?: boolean): void }
  setTextColor: { (color: string, canToggle?: boolean): void }
  setTextHighlight: { (color: string, canToggle?: boolean): void }
  nextPage: { (): void }
  previousPage: { (): void }
  setBold: { (canToggle?: boolean): void }
  setItalic: { (canToggle?: boolean): void }
  setUndeerline: { (canToggle?: boolean): void }
}

const setCss = (css: string, canToggle = true) => {
  if (css.includes('font-size'))
    throw new Error(
      'setting font-size using actions.setCss is not supporting, use actions.setFontSize instead.'
    )
  Editor.getInstance().setCss(stringToCssObj(`${css};`), canToggle)
}

const setFontSize = (fontSize: string) => {
  Editor.getInstance().setCss(stringToCssObj(`font-size:${fontSize};`), false)
  Editor.getInstance().setCaretHeight(fontSize)
  const fontSizeMenu = FontSizeMenu.getInstance()
  if (fontSizeMenu)
    fontSizeMenu.setState({
      fontSize: parseInt(fontSize)
    })
}

const setTextShadow = (color: string, length: string, canToggle = true) => {
  Editor.getInstance().setCss(
    stringToCssObj(`text-shadow: ${color} 0px 0px ${length}px;`),
    canToggle
  )
}

const setTextColor = (color: string, canToggle = true) => {
  Editor.getInstance().setCss(stringToCssObj(`color:${color};`), canToggle)
}

const setTextHighlight = (color: string, canToggle = true) => {
  Editor.getInstance().setCss(
    stringToCssObj(`background-color:${color};`),
    canToggle
  )
}

const nextPage = () => {
  List.getOpened().nextPage()
}

const previousPage = () => {
  List.getOpened().previousPage()
}

const setBold = (canToggle = true) => {
  Editor.getInstance().setCss(stringToCssObj(`font-weight:bold;`), canToggle)
}

const setItalic = (canToggle = true) => {
  Editor.getInstance().setCss(stringToCssObj(`font-style: italic;`), canToggle)
}

const setUnderline = (canToggle = true) => {
  Editor.getInstance().setCss(
    stringToCssObj(`text-decoration:underline;`),
    canToggle
  )
}

export const EditorActions: Actions = {
  setCss: setCss,
  setTextShadow: setTextShadow,
  setTextColor: setTextColor,
  setTextHighlight: setTextHighlight,
  nextPage: nextPage,
  previousPage: previousPage,
  setItalic: setItalic,
  setUndeerline: setUnderline,
  setBold: setBold,
  setFontSize: setFontSize
}
