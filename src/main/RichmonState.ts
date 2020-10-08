import { position } from './types'

export type RichmonState = {
  textColor: string
  highlightColor: string
  fontSize: string
  bold: Boolean
  italic: Boolean
  textToAdd: any[]
  html: string
  caretPosition: position
  isCaretHidden: boolean
  StyledCaret: any
}
