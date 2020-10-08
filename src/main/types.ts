export interface Struct {
  tools: (JSX.Element | string)[]
}

export interface TabsStruct
  extends Record<string, Struct | string | undefined> {
  defaultTab?: string
  tab1?: Struct
  tab2?: Struct
  tab3?: Struct
  tab4?: Struct
  tab5?: Struct
  tab6?: Struct
  tab7?: Struct
  tab8?: Struct
  tab9?: Struct
  tab10?: Struct
}

export interface ModalsStruct extends Record<string, Struct | undefined> {
  modal1?: Struct
  modal2?: Struct
  modal3?: Struct
  modal4?: Struct
  modal5?: Struct
}

export interface RichmonPropTypes {
  config: {
    defaultTheme?: string
    defaultTextColor: string
    defaultHighlightColor: string
    defaultFontSize: string
  }
  struct: Struct | TabsStruct
  modals?: ModalsStruct
}

export interface Text {
  text: string
  color?: string
  hgColor?: string
  size?: string
}

export interface RichmonComponentProps {
  setTextColor: { (color: string): void }
  highlightText: { (color: string): void }
  setBold: { (): void }
  setItalic: { (): void }
}

export interface RichmonButtonProps extends RichmonComponentProps {
  actions: (string | { (): any })[]
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
