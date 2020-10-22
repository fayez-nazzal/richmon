export interface RichmonPropTypes {
  config: {
    defaultTextColor: string
    defaultHighlightColor: string
    defaultFontSize: string
    imageTools: (JSX.Element | string)[]
  }
  top: (JSX.Element | string)[]
}

export interface Text {
  text: string
  color?: string
  hgColor?: string
  size?: string
}

export interface RichmonComponentProps {
  setCss: { (css: {}, canToggle?: boolean): void }
  insertTable: { (rows: number, cols: number, css?: string): void }
  insertImage: { (src: string): void }
  deleteSelectedImage: { (): void }
}

export interface RichmonButtonProps extends RichmonComponentProps {
  actions: (string | { (): any })[]
  text: string
}

export interface RichmonListProps extends RichmonComponentProps {
  dir: string
  tools: (JSX.Element | string)[]
  text: string
}

export interface EditorProps {
  html: string
  setEditorHTML: { (html: string): void }
  setIsCaretHidden: { (isCaretHidden: boolean): void }
  setCaretPos: { (caretPosition: position): void }
  defaultTextColor: string
  defaultHgColor: string
  defaultFontSize: string
}

export interface attribute {
  name: string
  value: string
}

export interface position {
  top: number
  left: number
}
