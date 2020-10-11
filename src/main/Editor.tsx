import React from 'react'
import './style.css'
import assert from 'assert'
import { attribute, EditorProps } from './types'
import styled from 'styled-components'

enum Action {
  None,
  Highlight,
  Color,
  Size
}

class Editor extends React.Component<EditorProps> {
  public selfRef: any = React.createRef()
  public currentDiv: Element
  public currentChild: HTMLElement
  private textColor: string = this.props.defaultTextColor
  private hgColor: string = this.props.defaultHgColor
  private fontSize: string = this.props.defaultFontSize
  private nextAction = Action.None

  constructor(props: EditorProps) {
    super(props)
  }

  componentDidMount() {
    const selfElem = this.selfRef.current as Element
    this.currentDiv = selfElem.children[0]
    this.currentChild = this.addNewSpan(
      this.getTextAttributes(),
      undefined,
      undefined
    )
    this.currentChild.innerText = '\u200b'
    this.commitChanges()
  }

  shouldComponentUpdate() {
    return false
  }

  setCurrentElements() {
    const sel = window.getSelection()!
    const node = sel.anchorNode!
    const parentNode = node.parentNode!

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

    assert(this.currentDiv.nodeName === 'DIV')
    assert(this.currentChild.nodeName === 'SPAN')
  }

  commitChanges = () => {
    const selfElem = this.selfRef.current as Element
    const html = selfElem.innerHTML
    this.props.setEditorHTML(html)
  }

  highlightText = (color: string) => {
    this.hgColor = color
    this.nextAction = Action.Highlight
  }

  appendElement = (type: string, attrs: attribute[], text = '') => {
    const elem = document.createElement(type)
    for (let i = 0; i < attrs.length; i++) {
      elem.setAttribute(attrs[i].name, attrs[i].value)
    }
    elem.innerHTML = text
    this.currentDiv.append(elem)
    return elem
  }

  createNewElement = (type: string, attrs: attribute[]) => {
    const elem = document.createElement(type)
    for (let i = 0; i < attrs.length; i++) {
      elem.setAttribute(attrs[i].name, attrs[i].value)
    }
    this.currentDiv.append(elem)
    return elem
  }

  getTextAttributes(hgColor = this.hgColor) {
    return [
      {
        name: 'style',
        value: `color:${this.textColor};background-color:${hgColor};font-size:${this.fontSize};`
      },
      {
        name: 'class',
        value: 'text'
      }
    ]
  }

  insertAfter(newNode: HTMLElement, existingNode: HTMLElement) {
    existingNode.parentNode!.insertBefore(newNode, existingNode.nextSibling)
  }

  insertNewAfter = (
    type: string,
    text: string,
    elemBefore: HTMLElement,
    attrs: attribute[]
  ) => {
    const elem = document.createElement(type)
    for (let i = 0; i < attrs.length; i++) {
      elem.setAttribute(attrs[i].name, attrs[i].value)
    }
    elem.innerHTML = text
    elem.onmousedown = (e) => {
      e.preventDefault()
    }
    this.insertAfter(elem, elemBefore)
    return elem as HTMLElement
  }

  addNewSpan = (attrs: attribute[], text = '', elemBefore?: HTMLElement) => {
    const elem = elemBefore
      ? this.insertNewAfter('span', text, elemBefore, attrs)
      : this.appendElement('span', attrs, text)
    return elem as HTMLSpanElement
  }

  onInput = (blur = false) => {
    if (!blur && this.nextAction === Action.Highlight) {
      const text = this.currentChild.innerText.slice(-1)
      this.currentChild.innerText = this.currentChild.innerText.slice(0, -1)
      this.currentChild = this.addNewSpan(
        this.getTextAttributes(this.hgColor),
        text
      )
      this.nextAction = Action.None
      this.hgColor = this.props.defaultHgColor
      this.select(this.currentChild, 1)
    }

    if (
      !blur &&
      this.currentChild.isEqualNode(this.currentDiv.children[0]) &&
      this.currentChild.innerText.length === 2 &&
      this.currentChild.innerHTML.includes('\u200b')
    ) {
      this.currentChild.innerHTML = this.currentChild.innerHTML.replace(
        '\u200b',
        ''
      )
      this.select(this.currentChild, 1)
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
      if (left === 0) {
        left =
          parent.getBoundingClientRect().left +
          parent.getBoundingClientRect().width
        console.log('left: ' + left)
      }
      const obj = {
        top: top,
        left: left
      }
      return obj
    } catch {
      alert('!!')
      return { top: 414, left: 211 }
    }
  }

  update = () => {
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

  selectRange = (
    startElem: Node,
    startOffset: number,
    endElem: Node,
    endOffset: number
  ) => {
    const sel = window.getSelection()!
    const range = document.createRange()
    range.setStart(startElem, startOffset)
    range.setEnd(endElem, endOffset)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  highlightRange() {
    const sel = window.getSelection()!
    const startOffset = Math.min(sel.anchorOffset, sel.focusOffset)
    const endOffset = Math.max(sel.anchorOffset, sel.focusOffset)
    const startNode = this.findSelectedSpan(sel.anchorNode!)
    const endNode = this.findSelectedSpan(sel.focusNode!)

    console.log(`start: ${startNode} at ${startOffset}
                  end: ${endNode} at ${endOffset}`)

    let elem: HTMLElement | null = startNode
    const buff = [
      elem.innerText.slice(
        startOffset + 1,
        startNode.isEqualNode(endNode) ? endOffset : undefined
      )
    ]
    let i = 0
    let elems: HTMLElement[] = []
    while (elem && !startNode.isEqualNode(endNode)) {
      if (elem.nextElementSibling) {
        elem = elem.nextElementSibling as HTMLElement | null
      } else {
        elem = elem.parentElement!.nextElementSibling
          ?.children[0] as HTMLElement | null
        i++
      }

      if (elem) {
        const txt = elem.isEqualNode(endNode)
          ? elem.innerText.slice(0, endOffset - 1)
          : elem.innerText
        buff[i] = buff[i] ? buff[i] + txt : txt
        if (elem.isEqualNode(endNode)) break
        elems.push(elem)
      }
    }

    startNode.innerText = startNode.innerText.slice(0, startOffset + 1)
    endNode.innerText = endNode.innerText.slice(endOffset - 1)

    elems.forEach((elem) => elem.remove())
    elems = []

    const startLine = startNode.parentElement as HTMLElement
    let line = startLine

    this.hgColor = 'blue'

    buff.forEach((text, index) => {
      const span = this.createNewElement('span', this.getTextAttributes())
      span.innerText = text
      if (!index) line!.append(span)
      else line!.prepend(span)
      elems.push(span)
      line = line!.nextElementSibling as HTMLElement
    })

    console.log(`selstartNode: ${elems[0].childNodes[0]} at ${0}
                  selEndNode: ${elems[elems.length - 1].childNodes[0]} at ${3}`)
    this.selectRange(
      elems[0].childNodes[0],
      0,
      elems[elems.length - 1].childNodes[0],
      3
    )
    console.log(buff)
  }

  findSelectedSpan = (node: Node) => {
    const n =
      node.nodeName === '#text'
        ? node.parentElement
        : node.nodeName === 'SPAN'
        ? node
        : node.nodeName === 'DIV'
        ? node
        : null
    assert(node !== null && node !== undefined)
    return n as HTMLElement
  }

  onMouseUp = () => {
    this.update()
  }

  onKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey) this.highlightRange()
  }

  onSelect = () => {
    this.update()
    console.log(window.getSelection())
  }

  render() {
    const ContentEditable = styled.div`
      width: 300px;
      height: 400px;
      border: 1px solid black;
    `
    return (
      <ContentEditable
        onInput={() => this.onInput()}
        onFocus={() => this.onInput()}
        onBlur={() => this.onInput(true)}
        onMouseUp={this.onMouseUp}
        onKeyDown={this.onKeyDown}
        onSelect={this.onSelect}
        ref={this.selfRef}
        style={{ padding: 10, whiteSpace: 'pre-wrap' }}
        dir='auto'
        contentEditable
        dangerouslySetInnerHTML={{ __html: this.props.html }}
      />
    )
  }
}

export default Editor
