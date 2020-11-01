import Editor from './Editor'
import List from './List'
import { stringToCssObj } from './richmonUtils'

export interface Actions {
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

const setCss = (args: string, canToggle = true) => {
  Editor.getInstance().setCss(stringToCssObj(`color:${args[0]};`), canToggle)
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
  setBold: setBold
}
