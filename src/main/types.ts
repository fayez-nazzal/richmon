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
  parent: React.Component
}

export interface RichmonButtonProps extends RichmonComponentProps {
  actions: (string | { (): any })[]
  className?: string
  style?: React.CSSProperties
  css?: string
}

export interface RichmonListProps {
  dir: string
  tools: (JSX.Element | string)[]
  parent: React.Component
}

export interface RichmonGridProps {
  tools: (JSX.Element | string)[]
  firstRow?: JSX.Element[] | JSX.Element
  lastRow?: JSX.Element[] | JSX.Element
  children?: any
  templateCols: string
  templateRows: string
  css?: string
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
