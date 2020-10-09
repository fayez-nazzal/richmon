import React from 'react'
import './style.css'
import assert from 'assert'
import { attribute, EditorProps } from './types'

class Editor extends React.Component<EditorProps> {
  public selfRef: any = React.createRef()
  public currentDiv: Element
  public currentChild: HTMLElement
  private textColor: string = this.props.defaultTextColor
  private hgColor: string = this.props.defaultHgColor
  private fontSize: string = this.props.defaultFontSize

  constructor(props: EditorProps) {
    super(props)
  }

  componentDidMount() {
    const selfElem = this.selfRef.current as Element
    this.currentDiv = selfElem.children[0]
    this.currentChild = this.appendTextSpan(true)
    this.commitChanges()
    // this.lastTextColor = this.props.textColor
    // this.lastHgColor = this.props.hgColor
  }

  shouldComponentUpdate() {
    return false
  }

  setCurrentElements() {
    const sel = window.getSelection()
    console.log(sel)
    if (sel === null) return
    const node = sel.anchorNode
    if (node === null) return
    const parentNode = node.parentNode
    if (parentNode === null) return
    this.currentDiv =
      parentNode.nodeName === 'SPAN'
        ? (parentNode.parentNode as Element)
        : node.nodeName === 'SPAN'
        ? (node.parentNode as Element)
        : (node as Element)
    this.currentChild =
    parentNode.nodeName === 'SPAN'
      ? (parentNode as HTMLElement)
      : node.nodeName === 'SPAN'
      ? (node as HTMLElement)
      : (node as HTMLElement)
    assert(this.currentDiv)
    assert(this.currentChild)

  }

  commitChanges = () => {
    const selfElem = this.selfRef.current as Element
    const html = selfElem.innerHTML
    this.props.setEditorHTML(html)
  }

  highlightText = (color: string) => {
    
    this.hgColor = color===this.hgColor? this.props.defaultHgColor:color
    this.currentChild = this.appendTextSpan(true)
    this.select(this.currentChild, 1)
  }

  appendElement = (type: string, addZeroSpace: boolean, ...attrs: attribute[]) => {
    const elem = document.createElement(type)
    for (let i = 0; i < attrs.length; i++) {
      elem.setAttribute(attrs[i].name, attrs[i].value)
    }
    if (addZeroSpace)
      elem.innerHTML = '\u200b'
    this.currentDiv.append(elem)
    return elem
  }

  appendTextSpan = (addZeroSpace=false) => {
    const elem = this.appendElement(
      'span',
      addZeroSpace,
      {
        name: 'style',
        value: `color:${this.textColor};background-color:${this.hgColor};font-size:${this.fontSize};`
      },
      {
        name: 'class',
        value: 'text'
      }
    )
    return elem as HTMLSpanElement
  }

  onInput = (blur = false) => {
    if (!this.currentChild.isEqualNode((this.selfRef.current as Element).firstChild!.firstChild) && this.currentChild.innerHTML.startsWith("\u200b")) {
      this.currentChild.innerHTML = this.currentChild.innerHTML.slice(1)
      this.select(this.currentChild.childNodes[0], 1)
    }

    this.commitChanges()
    this.props.setIsCaretHidden(blur)
  }

  getCaretPos = () => {
    const boundingRect = window
      .getSelection()!
      .getRangeAt(0)
      .getBoundingClientRect()
    try {
      let top = boundingRect.top
      let left = boundingRect.left
      let parent = this.currentChild as Element
      if (top === 0) top = parent.getBoundingClientRect().top
      if (left === 0) left = parent.getBoundingClientRect().left
      const obj = {
        top: top,
        left: left
      }
      console.log(parent, obj)
      return obj
    } catch {
      alert('!!')
      return { top: 414, left: 211 }
    }
  }

  updateCaretPos = () => {
    this.setCurrentElements()
    this.props.setCaretPos(this.getCaretPos())
  }

  select = (elem: Node, at: number) => {
    const sel = window.getSelection()
    const range = document.createRange()
    range.setStart(elem, at)
    if (sel === null) {
      alert('sel is null')
      return
    }
    sel.removeAllRanges()
    sel.addRange(range)
  }

  onKeyDown = (event: React.KeyboardEvent) => {
    this.updateCaretPos()
    console.log(event)
    // const sel = window.getSelection()
    this.setCurrentElements()
    this.commitChanges()
  }

  onMouseUp = () => {
    this.updateCaretPos()
  }

  onSelect = () => {
    this.updateCaretPos()
  }

  onKeyUp = (e: React.KeyboardEvent) => {
    // const sel = window.getSelection()
    if (e.key === 'Enter') {
      console.log(this.currentDiv)
    }
  }

  render() {
    return (
      <div
        onInput={() => this.onInput()}
        onFocus={() => this.onInput()}
        onBlur={() => this.onInput(true)}
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
        onMouseUp={this.onMouseUp}
        onSelect={this.onSelect}
        ref={this.selfRef}
        style={{ padding: 10 }}
        dir='auto'
        contentEditable
        dangerouslySetInnerHTML={{ __html: this.props.html }}
      ></div>
    )
  }
}

export default Editor
