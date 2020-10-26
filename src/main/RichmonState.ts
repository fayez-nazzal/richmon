import { position } from './types'

export type RichmonState = {
  textColor: string
  highlightColor: string
  fontSize: string
  colorsGridExtraCss: string
  bold: Boolean
  tools: JSX.Element[]
  italic: Boolean
  textToAdd: any[]
  html: string
  caretPosition: position
  isCaretHidden: boolean
  StyledCaret: any
}
