import React from 'react'
import './style.css'
import assert from 'assert'
import { EditorProps, Styles } from './types'
import styled from 'styled-components'
import { start } from 'repl'

class Editor extends React.Component<EditorProps> {
  public selfRef: any = React.createRef()
  public currentDiv: Element
  public currentChild: HTMLElement
  private lastCurrentChild: HTMLElement

  constructor(props: EditorProps) {
    super(props)
  }

  componentDidMount() {
    const selfElem = this.selfRef.current as Element
    this.currentDiv = selfElem.children[0]
    this.currentChild = this.createNewElement('span')
    this.setElementStyles(this.currentChild, {
      textColor: this.props.defaultTextColor,
      fontSize: this.props.defaultFontSize,
      hgColor: this.props.defaultHgColor
    })
    this.currentChild.innerText = '\u200b'
    this.currentDiv.append(this.currentChild)
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

  styleText = (styles: Styles) => {
    const sel = window.getSelection()
    if (!sel) return
    const isRanged = !(
      sel.anchorNode!.isSameNode(sel.focusNode!) &&
      sel.anchorOffset === sel.focusOffset
    )

    if (!isRanged) {
      const elem = this.createNewElement('span')
      this.setElementStyles(elem, styles)
      elem.innerText = '\u200b'
      this.currentDiv.insertBefore(elem, this.currentChild.nextElementSibling)
      this.currentChild = elem
      this.select(this.currentChild, 1)
    } else this.styleTextInRange(styles)
  }

  setTextColor = (textColor: string) => {
    this.styleText({ textColor })
  }

  setTextHighlight = (hgColor: string) => {
    this.styleText({ hgColor })
  }

  setFontSize = (fontSize: string) => {
    this.styleText({ fontSize })
  }

  setCss = (css: string) => {
    this.styleText({ css })
  }

  createNewElement = (type: string) => {
    const elem = document.createElement(type)
    return elem
  }

  setElementStyles(elem: HTMLElement, styles: Styles) {
    if (styles.css) {
      alert('css set')
      elem.setAttribute('style', styles.css)
    }
    if (styles.fontSize) elem.style.fontSize = styles.fontSize
    if (styles.hgColor) elem.style.backgroundColor = styles.hgColor
    if (styles.textColor) elem.style.color = styles.textColor
  }

  onInput = (blur = false) => {
    if (
      !blur &&
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
    if (
      this.lastCurrentChild &&
      !this.lastCurrentChild.isSameNode(this.currentDiv.children[0]) &&
      !this.lastCurrentChild.isSameNode(this.currentChild) &&
      this.lastCurrentChild.innerHTML === '\u200b'
    )
      this.lastCurrentChild.remove()
    this.lastCurrentChild = this.currentChild
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

  isBefore(node1: Node, node2: Node) {
    return (
      (node1.compareDocumentPosition(node2) &
        Node.DOCUMENT_POSITION_FOLLOWING) >
      0
    )
  }

  styleTextInRange(styles: Styles) {
    const sel = window.getSelection()!
    let startOffset = sel.anchorOffset
    let endOffset = sel.focusOffset
    let startNode = this.findSelectedSpan(sel.anchorNode!)
    let endNode = this.findSelectedSpan(sel.focusNode!)
    const oneNode = startNode.isSameNode(endNode)

    console.log(`start: ${startNode.innerText} at ${startOffset}
                  end: ${endNode.innerText} at ${endOffset}`)

    if (
      (oneNode && startOffset > endOffset) ||
      this.isBefore(endNode, startNode)
    ) {
      const tempNode = startNode
      const tempOffset = startOffset
      startNode = endNode
      endNode = tempNode
      startOffset = endOffset
      endOffset = tempOffset
    }

    let elem: HTMLElement | null = startNode
    const buff = [
      elem.innerText.slice(startOffset, oneNode ? endOffset : undefined)
    ]

    let i = 0
    let elems: HTMLElement[] = []

    while (elem && !oneNode) {
      console.log(elem.parentElement)
      if (elem.nextElementSibling) {
        elem = elem.nextElementSibling as HTMLElement | null
      } else {
        elem = elem.parentElement!.nextElementSibling
          ?.children[0] as HTMLElement | null
        i++
      }

      if (elem) {
        const txt = elem.isSameNode(endNode)
          ? elem.innerText.slice(0, endOffset)
          : elem.innerText
        buff[i] = buff[i] ? buff[i] + txt : txt
        if (elem.isSameNode(endNode)) {
          break
        }
        elems.push(elem)
      }
    }

    if (oneNode) {
      const txt = startNode.innerText.slice(endOffset)
      startNode.innerText = startNode.innerText.slice(0, startOffset)
      const afterNode = this.createNewElement('span')
      afterNode.setAttribute('style', startNode.getAttribute('style')!)
      afterNode.setAttribute('class', 'stext')
      afterNode.innerText = txt
      this.currentDiv.insertBefore(afterNode, startNode.nextElementSibling)
    } else {
      startNode.innerText = startNode.innerText.slice(0, startOffset)
      endNode.innerText = endNode.innerText.slice(endOffset)
    }

    if (styles.textColor) {
      const isAllColored = [startNode, ...elems, endNode].every(
        (el) => el.style.color === styles.textColor
      )
      styles.textColor = isAllColored
        ? this.props.defaultTextColor
        : styles.textColor
    }

    if (styles.hgColor) {
      const isAllHighlighted = [startNode, ...elems, endNode].every(
        (el) => el.style.backgroundColor === styles.hgColor
      )
      styles.hgColor = isAllHighlighted
        ? this.props.defaultHgColor
        : styles.hgColor
    }

    if (styles.fontSize) {
      const isAllFontSized = [startNode, ...elems, endNode].every(
        (el) => el.style.fontSize === styles.fontSize
      )
      styles.fontSize = isAllFontSized
        ? this.props.defaultFontSize
        : styles.fontSize
    }

    console.log(styles)

    elems.forEach((elem) => elem.remove())
    elems = []

    const startLine = startNode.parentElement as HTMLElement
    let line = startLine

    buff.forEach((text, index) => {
      const span = this.createNewElement('span')
      this.setElementStyles(span, styles)
      span.innerText = text
      if (!index) line!.insertBefore(span, startNode.nextElementSibling)
      else line!.prepend(span)
      elems.push(span)
      line = line!.nextElementSibling as HTMLElement
    })

    console.log(`selstartNode: ${elems[0].childNodes[0]} at ${0}
                  selEndNode: ${elems[elems.length - 1].childNodes[0]} at ${3}`)

    const selectionEnd = (elems[elems.length - 1]
      .childNodes[0] as CharacterData).data.length

    this.selectRange(
      elems[0].childNodes[0],
      0,
      elems[elems.length - 1].childNodes[0],
      selectionEnd
    )

    if (!endNode.innerText) endNode.remove()
    if (!startNode.innerText) startNode.remove()
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

  onKeyDown = (_event: React.KeyboardEvent) => {}

  onSelect = () => {
    this.update()
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
