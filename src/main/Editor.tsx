import React from 'react'
import './style.css'
import assert from 'assert'
import { EditorProps } from './types'
import styled from 'styled-components'
import {
  cssObjToString,
  stringToCssObj,
  isBefore,
  isMatchingKeysEqual
} from './richmonUtils'
import isEqual from 'lodash.isequal'

class Editor extends React.Component<EditorProps> {
  public selfRef: any = React.createRef()
  public currentDiv: Element
  public currentChild: HTMLElement
  private lastCurrentChild: HTMLElement
  private defaultCss = `color:${this.props.defaultTextColor};font-size:${this.props.defaultFontSize};`
  private cssSet: any = []

  constructor(props: EditorProps) {
    super(props)
  }

  componentDidMount() {
    const selfElem = this.selfRef.current as Element
    this.currentDiv = selfElem.children[0]
    this.currentChild = this.createNewElement('span')
    this.currentChild.innerText = '\u200b'
    this.currentDiv.append(this.currentChild)
    this.currentChild.setAttribute('style', this.defaultCss)
    this.commitChanges()
  }

  shouldComponentUpdate() {
    return false
  }

  // This may produce some propblems, especially with tables
  setCurrentElements() {
    const sel = window.getSelection()!
    console.log(sel.anchorNode?.nodeName)
    console.log(sel.anchorNode?.childNodes)
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
        : node.nodeName === 'DIV' && parentNode.nodeName === 'DIV'?
          (node as HTMLElement).children[0].children[0]==="SPAN"?
          (node as HTMLElement).children[0].children[0]:(node as HTMLElement).children[0].children[0].nodeName==="TABLE"?
          (node as HTMLElement).children[0].children[0].children[0].children[0]:(node as HTMLElement).children[0].children[0].nodeName==="IMG"?null:null
        ? ((node as HTMLElement).children[0] as HTMLElement)
        : node.nodeName === 'TD' || node.nodeName === 'TH'
        ? ((node as HTMLElement).children[0].children[0] as HTMLElement)
        : (node as HTMLElement)

    assert(this.currentDiv.nodeName === 'DIV')
    assert(this.currentChild.nodeName === 'SPAN')
  }

  commitChanges = () => {
    const selfElem = this.selfRef.current as Element
    const html = selfElem.innerHTML
    this.props.setEditorHTML(html)
  }

  // How to make it work with tables?, too... this.currentChild should be...
  styleText = (styles: any, canToggle: boolean) => {
    const sel = window.getSelection()

    if (!sel) return

    const isRanged = !(
      sel.anchorNode!.isSameNode(sel.focusNode!) &&
      sel.anchorOffset === sel.focusOffset
    )

    if (!isRanged) {
      const cssIndex = this.cssSet.findIndex((obj: any) =>
        isEqual(obj.styles, styles)
      )

      const currentStyles = stringToCssObj(
        this.currentChild.getAttribute('style')!
      )

      if (canToggle && isMatchingKeysEqual(currentStyles, styles)) {
        styles = this.cssSet[cssIndex].before
      } else if (canToggle) {
        const before = this.getElementBeforeStyle(this.currentChild, styles)
        this.cssSet.push({
          styles: styles,
          before: before
        })
      }

      const elem = this.createNewElement('span')
      elem.setAttribute(
        'style',
        cssObjToString({ ...currentStyles, ...styles })
      )
      elem.innerText = '\u200b'
      this.currentDiv.insertBefore(elem, this.currentChild.nextElementSibling)
      this.currentChild = elem
      this.select(elem.childNodes[0], 1)
    } else this.styleTextInRange(styles, canToggle)
  }

  styleTextInRange(styles: any, canToggle: boolean) {
    const sel = window.getSelection()!
    let startOffset = sel.anchorOffset
    let endOffset = sel.focusOffset
    let startNode = this.findSelectedSpan(sel.anchorNode!)
    let endNode = this.findSelectedSpan(sel.focusNode!)
    const oneNode = startNode.isSameNode(endNode)

    if ((oneNode && startOffset > endOffset) || isBefore(endNode, startNode)) {
      const tempNode = startNode
      const tempOffset = startOffset
      startNode = endNode
      endNode = tempNode
      startOffset = endOffset
      endOffset = tempOffset
    }

    let elem: HTMLElement | null = startNode
    const buff: any[] = [
      {
        text: elem.innerText.slice(
          startOffset,
          oneNode ? endOffset : undefined
        ),
        style: stringToCssObj(elem.getAttribute('style')!),
        selectionLine: 0
      }
    ]

    let n = 0
    let elems: HTMLElement[] = []

    while (elem && !oneNode) {
      if (elem.nextElementSibling) {
        elem = elem.nextElementSibling as HTMLElement | null
      } else {
        elem = elem.parentElement!.nextElementSibling
          ?.children[0] as HTMLElement | null
        n++
      }

      if (elem) {
        const txt = elem.isSameNode(endNode)
          ? elem.innerText.slice(0, endOffset)
          : elem.innerText
        buff.push({
          text: txt,
          style: stringToCssObj(elem.getAttribute('style')!),
          selectionLine: n
        })
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

    const cssIndex = this.cssSet.findIndex((obj: any) =>
      isEqual(obj.styles, styles)
    )

    if (cssIndex !== -1) {
      const isAllSameStyle = [startNode, ...elems, endNode].every((el) =>
        isMatchingKeysEqual(stringToCssObj(el.getAttribute('style')!), styles)
      )

      if (isAllSameStyle) {
        styles = this.cssSet[cssIndex].before
      }
    } else if (canToggle) {
      const before = this.getElementBeforeStyle(startNode, styles)

      this.cssSet.push({
        styles,
        before
      })
    }

    elems.forEach((elem) => elem.remove())
    elems = []

    const startLine = startNode.parentElement as HTMLElement
    let line = startLine
    let node: Element | null = startNode

    buff.forEach((elemObj, index) => {
      const span = this.createNewElement('span')
      span.innerText = elemObj.text
      const css = cssObjToString({ ...elemObj.style!, ...styles })
      span.setAttribute('style', css)
      if (
        elemObj.selectionLine === 0 ||
        elemObj.selectionLine === buff[index - 1].selectionLine
      ) {
        line!.insertBefore(span, node!.nextElementSibling)
        node = node!.nextElementSibling
      } else if (elemObj.selectionLine > buff[index - 1].selectionLine) {
        line = line!.nextElementSibling as HTMLElement
        line!.prepend(span)
        node = line!.children[0]
      } else {
        alert('something wrong')
      }
      elems.push(span)
    })

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

  getElementBeforeStyle(elem: HTMLElement, styles: any) {
    const stylesKeys = Object.keys(styles)
    const before: any = {}
    const elemStyles = stringToCssObj(elem.getAttribute('style')!)
    for (let i = 0; i < stylesKeys.length; i++) {
      before[stylesKeys[i]] = elemStyles[stylesKeys[i]]
        ? elemStyles[stylesKeys[i]]
        : 'initial'
    }
    return before
  }

  setCss = (css: any, canToggle = false) => {
    this.styleText(css, canToggle)
  }

  createNewElement = (type: string) => {
    const elem = document.createElement(type)
    return elem
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
      alert('removing zero width space')
    }

    this.commitChanges()
    this.props.setIsCaretHidden(blur)
  }

  getCaretPos = () => {
    const supportPageOffset = window.pageXOffset !== undefined
    const isCSS1Compat = (document.compatMode || '') === 'CSS1Compat'

    const scrollX = supportPageOffset
      ? window.pageXOffset
      : isCSS1Compat
      ? document.documentElement.scrollLeft
      : document.body.scrollLeft
    const scrollY = supportPageOffset
      ? window.pageYOffset
      : isCSS1Compat
      ? document.documentElement.scrollTop
      : document.body.scrollTop

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
      }
      const obj = {
        top: top + scrollY,
        left: left + scrollX
      }
      return obj
    } catch {
      alert('!!')
      return { top: 414, left: 211 }
    }
  }

  update = () => {
    this.setCurrentElements()
    // if (
    //   this.lastCurrentChild &&
    //   !this.lastCurrentChild.isSameNode(this.currentDiv.children[0]) &&
    //   !this.lastCurrentChild.isSameNode(this.currentChild) &&
    //   this.lastCurrentChild.innerHTML === '\u200b'
    // ) {
    //   this.lastCurrentChild.remove()
    //   alert('rmv')
    // }
    console.debug(this.lastCurrentChild)
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

  insertTable = (rows: number, cols: number, css: string) => {
    const table = this.createNewElement('table')
    this.currentDiv.parentElement!.appendChild(table)
    for (let i = 0; i < rows; i++) {
      const tr = this.createNewElement('tr')
      table.appendChild(tr)
      table.style.borderCollapse = 'collapse'
      for (let j = 0; j < cols; j++) {
        const col =
          i === 0 ? this.createNewElement('th') : this.createNewElement('td')
        col.style.border = '1px solid black'
        col.style.padding = '10px 20px'
        col.style.margin = '0'
        const div = this.createNewElement('div')
        const span = this.createNewElement('span')
        span.innerHTML = '\u200b'
        tr.appendChild(col)
        col.appendChild(div)
        div.appendChild(span)
      }
    }
    this.currentDiv = table.firstElementChild!.firstElementChild!
      .firstElementChild! as HTMLElement
    this.currentChild = table.firstElementChild!.firstElementChild!
      .firstElementChild!.firstElementChild! as HTMLElement

    this.select(this.currentChild, 1)
    console.log(css)
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
