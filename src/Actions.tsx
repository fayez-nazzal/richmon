import Editor from './main/Components/RichEditor'
import FontSizeMenu from './main/Components/FontSizeMenu'
import RichMenu from './main/Components/RichMenu'
import { stringToCssObj } from './richmonUtils'

export type orderedListTypes =
  | 'decimal'
  | 'decimal-leading-zero'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'lower-latin'
  | 'upper-latin'
  | 'lower-roman'
  | 'upper-roman'
  | 'georgian'
  | 'none'
  | 'armenian'
  | 'cjk-ideographic'
  | 'hiragana'
  | 'hiragana-iroha'
  | 'katakana'
  | 'katakana-iroha'

export type unOrderedListTypes = 'disc' | 'circle' | 'square'

export interface ActionTypes {
  setFontSize: { (fontSize: string): void }
  setCss: { (css: string, canToggle?: boolean): void }
  setTextShadow: { (color: string, length: string, canToggle?: boolean): void }
  setTextColor: { (color: string, canToggle?: boolean): void }
  setTextHighlight: { (color: string, canToggle?: boolean): void }
  nextPage: { (): void }
  previousPage: { (): void }
  setBold: { (canToggle?: boolean): void }
  setItalic: { (canToggle?: boolean): void }
  setUnderline: { (canToggle?: boolean): void }
  setStrikeThrough: { (canToggle?: boolean): void }
  insertImage: {
    (src: string, css: string, selectCss: string, autoResize: boolean): void
  }
  insertTable: {
    (rows: number, cols: number, cssString?: string, selectable?: boolean): void
  }
  setSub: { (): void }
  setSup: { (): void }
  insertUList: {
    (styleType?: unOrderedListTypes): void
  }
  insertUListWithStyleImages: {
    (url: string): void
  }
  insertOList: {
    (styleType?: orderedListTypes): void
  }
}

const insertTable = (
  rows: number,
  cols: number,
  cssString: string = '',
  selectable: boolean = true
) => {
  Editor.getInstance().insertTable(rows, cols, cssString, selectable)
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
  RichMenu.getOpened().nextPage()
}

const previousPage = () => {
  RichMenu.getOpened().previousPage()
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

const setStrikeThrough = (canToggle = true) => {
  Editor.getInstance().setCss(
    stringToCssObj(`text-decoration:line-through;`),
    canToggle
  )
}

const insertImage = (src: string) => {
  Editor.getInstance().insertImage(src)
}

const setSub = () => {
  Editor.getInstance().setSub()
}

const setSup = () => {
  Editor.getInstance().setSup()
}

const insertOList = (
  styleType: orderedListTypes = 'decimal',
  padding = '0 18px'
) => {
  Editor.getInstance().addList(
    'ol',
    `list-style-type:${styleType};padding:${padding};margin-top:0;margin-bottom:0;`
  )
}

const insertUList = (
  styleType: unOrderedListTypes = 'disc',
  padding = '0 18px'
) => {
  Editor.getInstance().addList(
    'ul',
    `list-style-type:${styleType};padding:${padding};margin-top:0;margin-bottom:0;`
  )
}

const insertUListWithStyleImages = (url: string, padding = '0 18px') => {
  Editor.getInstance().addList(
    'ul',
    `list-style-image:url('${url}');padding:${padding};margin-top:0;margin-bottom:0;`
  )
}

export const Actions: ActionTypes = {
  setCss,
  setTextShadow,
  setTextColor,
  setTextHighlight,
  nextPage,
  previousPage,
  setItalic,
  setUnderline,
  setStrikeThrough,
  setBold,
  setFontSize,
  insertImage,
  insertTable,
  setSub,
  setSup,
  insertOList,
  insertUList,
  insertUListWithStyleImages
}
