import React from 'react'
import ReactDOMServer from 'react-dom/server'
import styled, { css } from 'styled-components'
import {
  cssObjToString,
  stringToCssObj,
  isBefore,
  isMatchingKeysEqual,
  createElementFromHTML,
  createNewElement,
  isRTL
} from '../../richmonUtils'
import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import { parseCSS } from 'css-parser'

export interface EditorProps {
  html: string
  setEditorHTML: { (html: string): void }
  setIsCaretHidden: { (isCaretHidden: boolean): void }
  setCaretPos: { (caretPosition: { top: number; left: number }): void }
  isCaretHidden: boolean
  defaultTextColor: string
  defaultHgColor: string
  defaultFontSize: string
  caretHeight: string
  disableSmoothCaret: boolean
  setCaretHeight: { (height: string): void }
  setCaretDelay: { (delay: string): void }
  caretDelay: string
  resetCaretDelay: { (): void }
  caretPos: { left: number; top: number }
  width: string
  height: string
  padding: string
  caretColor: string
  css: string
  fontSizeMenu: any
}

interface StyledContentEditableProps {
  padding: string
  disableSmoothCaret: boolean
  caretColor: string
  css: string
}

interface HistoryObject {
  html: string
  anchorDivIndex: number
  anchorChildIndex: number
  focusDivIndex: number
  focusChildIndex: number
  anchorOffset: number
  focusOffset: number
}

const ContentEditable = styled.div`
  box-sizing: border-box;
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow-y: auto;
  &:focus {
    outline: none;
  }
  flex: 1 1 auto;
  ${(props: StyledContentEditableProps) => css`
    caret-color: ${props.disableSmoothCaret
      ? 'props.caretColor'
      : 'transparent'};
    padding: ${props.padding};
    ${props.css}
  `}
`

class Editor extends React.Component<EditorProps> {
  public selfRef: any = React.createRef()
  public currentDiv: HTMLElement
  public nextMainCurrentDiv: HTMLElement | null
  public currentChild: HTMLElement
  private defaultCss = `color:${this.props.defaultTextColor};font-size:${this.props.defaultFontSize};`
  private cssSet: any = []
  private selectedCells: any = {}
  private selTable: HTMLElement | null
  private onList = false
  private selImage: HTMLImageElement | null
  private RectangleSelector: HTMLElement
  private selAll: boolean = false
  private selRectangleCoords: {
    x1: number
    y1: number
    x2: number
    y2: number
  } = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0
  }
  private lastKeyPressed: string
  private lastKeyPressedDate: Date
  private lastCombPressed: string
  private backHistory: HistoryObject[] = []
  private forwardHistory: HistoryObject[] = []
  private static _instance: Editor

  private constructor(props: EditorProps) {
    super(props)
    Editor._instance = this
  }

  public static getInstance() {
    return this._instance
  }

  componentDidMount() {
    this.init()
  }

  init = () => {
    if (this.props.html.includes('<')) {
      throw new Error(
        'Providing initial html content is not yet supported, please provide just text or empty string.'
      )
    } else this.selfRef.current.innerHTML = '<div></div>'

    const selfElem = this.selfRef.current as Element
    this.currentDiv = selfElem.children[0] as HTMLElement
    this.currentChild = createNewElement('span')
    this.currentChild.innerText = this.props.html ? this.props.html : '\u200b'
    this.currentDiv.append(this.currentChild)
    this.currentChild.setAttribute('style', this.defaultCss)
    this.setCaretHeight(this.currentChild.style.fontSize)
    this.commitChanges()
    this.RectangleSelector = createNewElement('div')
    this.RectangleSelector.hidden = true
    this.RectangleSelector.style.position = 'absolute'
    this.RectangleSelector.style.border = '1px dashed #6C747680'
    this.RectangleSelector.style.backgroundColor = '#68b0ab50'
    this.RectangleSelector.style.pointerEvents = 'none'
    this.selfRef.current.prepend(this.RectangleSelector)
    this.select(
      this.currentChild.childNodes[0],
      this.currentChild.innerText.length
    )
    this.currentDiv.style.lineHeight = this.props.caretHeight
    this.addToHistory()
    this.selfRef.current.blur()
  }

  addToHistory = (history: 'back' | 'forward' = 'back') => {
    const sel = window.getSelection()!

    const anchorElems = this.getUnderlyingElements(
      sel.anchorNode! as HTMLElement
    )!
    const focusElems = this.getUnderlyingElements(
      sel.focusNode! as HTMLElement
    )!

    const obj = {
      html: this.selfRef.current.innerHTML,
      anchorDivIndex: [].slice
        .call(this.selfRef.current.children)
        .indexOf(
          anchorElems[0].nodeName === 'LI'
            ? anchorElems[0].parentElement!
            : anchorElems[0]
        ),
      anchorChildIndex: [].slice
        .call(focusElems[0].children)
        .indexOf(focusElems[1]),
      focusDivIndex: [].slice
        .call(this.selfRef.current.children)
        .indexOf(
          anchorElems[0].nodeName === 'LI'
            ? focusElems[0].parentElement!
            : focusElems[0]
        ),
      focusChildIndex: [].slice
        .call(focusElems[0].children)
        .indexOf(focusElems[1]),
      anchorOffset: sel.anchorOffset,
      focusOffset: sel.focusOffset
    }

    history === 'back'
      ? this.backHistory.push(obj)
      : this.forwardHistory.push(obj)
  }

  shouldComponentUpdate() {
    return false
  }

  setCurrentElements(elems: HTMLElement[]) {
    const sel = window.getSelection()
    if (!sel) return
    const node = sel.anchorNode as HTMLElement
    if (!node) return

    this.currentDiv = elems[0]
    this.currentChild = elems[1]

    this.nextMainCurrentDiv = this.selTable
      ? (this.selTable.nextElementSibling as HTMLElement)
      : (this.currentDiv.nextElementSibling as HTMLElement)

    this.onList =
      this.currentDiv.nodeName === 'LI' ||
      this.currentDiv.parentElement!.nodeName === 'UL' ||
      this.currentDiv.parentElement!.nodeName === 'OL'

    this.selTable = ['TD', 'TH'].includes(
      this.currentDiv.parentElement!.nodeName
    )
      ? (this.currentDiv.parentElement!.parentElement!
          .parentElement! as HTMLElement)
      : null
  }

  getUnderlyingElements = (node: HTMLElement) => {
    const nodeName = node.nodeName
    const parentNode = node.parentNode!
    const parentName = parentNode.nodeName

    let child: HTMLElement
    let div: HTMLElement

    switch (nodeName) {
      case 'SPAN':
      case 'SUB':
      case 'SUP':
        div = parentNode as HTMLElement
        child = node as HTMLElement
        break
      case '#text':
        div = parentNode.parentNode as HTMLElement
        child = parentNode as HTMLElement
        break
      case 'TD':
        div = (node as HTMLElement).firstElementChild! as HTMLElement
        child = div.firstElementChild! as HTMLElement
        break
      case 'TABLE':
        div = (node as HTMLElement).firstElementChild!.firstElementChild!
          .firstElementChild! as HTMLElement
        child = div.firstElementChild! as HTMLElement

        break
      case (node as HTMLElement).firstElementChild?.nodeName === 'DIV' && 'DIV':
        div = (node as HTMLElement).firstElementChild! as HTMLElement
        child = div.firstElementChild! as HTMLElement
        break
      case (node as HTMLElement).firstElementChild?.nodeName === 'TABLE' &&
        'DIV':
        div = (node as HTMLElement).firstElementChild!.firstElementChild!
          .firstElementChild!.firstElementChild! as HTMLElement
        child = div.firstElementChild as HTMLElement
        break
    }

    if (parentName === 'TD') {
      div = node as HTMLElement
      child = div.firstElementChild! as HTMLElement
    }

    return [div!, child!]
  }

  commitChanges = (action?: 'back' | 'forward') => {
    let html = this.selfRef.current.innerHTML

    html = action ? this.historyAction(action) : html

    this.props.setEditorHTML(html)
  }

  historyAction = (action?: 'back' | 'forward') => {
    this.addToHistory(action === 'back' ? 'forward' : 'back')
    this.props.setCaretDelay('0ms')

    const historyObj =
      action === 'back' ? this.backHistory.pop()! : this.forwardHistory.pop()!
    const html = historyObj.html

    const lastSelAnchor = historyObj.anchorOffset
    const lastSelFocus = historyObj.focusOffset

    this.selfRef.current.innerHTML = html

    const anchorNode = this.selfRef.current.children[historyObj.anchorDivIndex]
      .children[historyObj.anchorChildIndex]
    const focusNode = this.selfRef.current.children[historyObj.focusDivIndex]
      .children[historyObj.focusChildIndex]

    this.selectRange(
      anchorNode.childNodes[0],
      lastSelAnchor,
      focusNode.childNodes[0],
      lastSelFocus
    )
    return html
  }

  isRanged = () => {
    const sel = window.getSelection()!
    return !(
      sel.anchorNode!.isSameNode(sel.focusNode!) &&
      sel.anchorOffset === sel.focusOffset
    )
  }

  guaranteeSelection = (sel: Selection | null) => {
    ;(!sel || !sel.anchorNode || !sel.focusNode) &&
      this.select(
        this.currentChild.childNodes[0],
        this.currentChild.innerHTML.length
      )
  }

  styleText = (styles: any, canToggle: boolean) => {
    let sel = window.getSelection()

    // if nothing is selected, select current child
    this.guaranteeSelection(sel)
    this.currentChild &&
      this.currentChild.innerText !== '\u200b' &&
      this.addToHistory()

    sel = sel!

    if (!this.isRanged()) {
      ;['\u200b', ''].includes(this.currentChild.innerHTML) &&
        this.currentChild.remove()

      const cssIndex = this.cssSet.findIndex((obj: any) =>
        isEqual(obj.styles, styles)
      )

      const currentStyles = stringToCssObj(
        this.currentChild.getAttribute('style')!
      )

      if (canToggle && isMatchingKeysEqual(currentStyles, styles)) {
        styles = this.cssSet[cssIndex].before
      } else if (canToggle) {
        const before = this.getElementWithInitStyles(this.currentChild, styles)
        this.cssSet.push({
          styles: styles,
          before: before
        })
      }

      const elem = createNewElement(
        this.currentChild.nodeName === 'SUB'
          ? 'sub'
          : this.currentChild.nodeName === 'SUP'
          ? 'sup'
          : 'span'
      )
      elem.setAttribute(
        'style',
        cssObjToString({ ...currentStyles, ...styles })
      )
      elem.innerText = '\u200b'
      this.currentDiv.insertBefore(elem, this.currentChild.nextElementSibling)

      if (sel.anchorOffset < this.currentChild.innerText.length) {
        const text = this.currentChild.innerText.slice(sel.anchorOffset)
        this.currentChild.innerText = this.currentChild.innerText.substring(
          0,
          sel.anchorOffset
        )
        const childAfter = this.currentChild.cloneNode() as HTMLElement
        childAfter.innerText = text
        this.currentDiv.insertBefore(childAfter, elem.nextElementSibling)
      }

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
      const afterNode = createNewElement('span')
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
      const before = this.getElementWithInitStyles(startNode, styles)

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
      const span = createNewElement('span')
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

    !endNode.innerText && endNode.remove()
    !startNode.innerText && startNode.remove()
  }

  getElementWithInitStyles(elem: HTMLElement, styles: any) {
    const stylesKeys = Object.keys(styles)
    const stylesWithInit: any = {}
    const elemStyles = stringToCssObj(elem.getAttribute('style')!)
    for (let i = 0; i < stylesKeys.length; i++) {
      stylesWithInit[stylesKeys[i]] = elemStyles[stylesKeys[i]]
        ? elemStyles[stylesKeys[i]]
        : 'initial'
    }
    return stylesWithInit
  }

  public setCss = (css: any, canToggle = false) => {
    this.styleText(css, canToggle)
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

    if (this.currentDiv.innerHTML.includes('<br>')) {
      this.currentDiv.innerHTML = this.currentDiv.innerHTML.replace('<br>', '')
      if (this.currentDiv.children[0]) {
        this.currentDiv.children[0]!.innerHTML = '\u200b'
        this.select(this.currentDiv.children[0].childNodes[0], 1)
        return { top: 0, left: 0 }
      } else {
        const span = createNewElement('span')
        span.innerText = '\u200b'
        this.currentDiv.append(span)
        this.currentChild = span
      }
    }

    const boundingRect = window
      .getSelection()!
      .getRangeAt(0)
      .getBoundingClientRect()
    try {
      let top = boundingRect.top
      let left = boundingRect.left

      const currentChildRect: DOMRect | null =
        top === 0 || left === 0
          ? this.currentChild.getBoundingClientRect()
          : null

      top =
        top === 0
          ? currentChildRect!.top === 0
            ? currentChildRect!.top
            : this.currentDiv.getBoundingClientRect().top
          : top

      left =
        left === 0
          ? currentChildRect!.left +
            (isRTL(this.currentDiv.innerText) ? 0 : currentChildRect!.width)
          : left

      const obj = {
        top: top + scrollY,
        left: left + scrollX
      }

      return obj
    } catch {
      throw new Error('Unexpected error getting caret position')
    }
  }

  update = () => {
    const sel = window.getSelection()!

    this.guaranteeSelection(sel)

    const elems = this.getNodesFromSelectEnds(sel)
    const anchorElems = elems[0]
    const focusElems = elems[1]

    anchorElems !== null && this.setCurrentElements(anchorElems)

    const firstDiv = this.selfRef.current.firstElementChild.nextElementSibling
    const lastDiv = this.selfRef.current.lastElementChild
    if (
      anchorElems &&
      focusElems &&
      !anchorElems[0].isSameNode(focusElems[0])
    ) {
      this.props.setIsCaretHidden(true)
      if (
        (sel.anchorOffset === 0 &&
          sel.focusOffset === focusElems[1].innerText.length &&
          anchorElems[0].isSameNode(firstDiv) &&
          focusElems[0].isSameNode(lastDiv) &&
          anchorElems[1].isSameNode(firstDiv.firstElementChild) &&
          focusElems[1].isSameNode(lastDiv.lastElementChild)) ||
        (sel.focusOffset === 0 &&
          sel.anchorOffset === anchorElems[1].innerText.length &&
          anchorElems[0].isSameNode(lastDiv) &&
          focusElems[0].isSameNode(firstDiv) &&
          anchorElems[1].isSameNode(lastDiv.lastElementChild) &&
          focusElems[1].isSameNode(firstDiv.firstElementChild))
      ) {
        this.addToHistory()
        this.selAll = true
      }
    }
  }

  getNodesFromSelectEnds = (sel: Selection) => {
    const anchorElems = this.getUnderlyingElements(
      sel!.anchorNode as HTMLElement
    )
    const focusElems = this.getUnderlyingElements(sel!.focusNode as HTMLElement)
    return [anchorElems, focusElems]
  }

  setCaretHeight = (height: string) => {
    this.props.setCaretHeight(height)
  }

  select = (elem: Node, at: number) => {
    const sel = window.getSelection()
    const range = document.createRange()
    range.setStart(elem, at)
    sel!.removeAllRanges()
    sel!.addRange(range)
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

  selectNode = (node: Node, preSel?: Selection) => {
    const sel = preSel ? preSel : window.getSelection()!
    sel.removeAllRanges()
    const range = document.createRange()
    range.selectNode(node)
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
    return n as HTMLElement
  }

  onMouseUp = (ev: React.MouseEvent) => {
    let node = document.elementFromPoint(ev.clientX, ev.clientY)! as HTMLElement
    let nodes = document.elementsFromPoint(ev.clientX, ev.clientY)!

    document.body.style.cursor = 'auto'

    if (this.selImage) {
      let span
      let img
      let div
      let mainDiv

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeName === 'SPAN') span = nodes[i]
        else if (nodes[i].isSameNode(this.selfRef.current)) mainDiv = nodes[i]
        else if (
          nodes[i].nodeName === 'IMG' &&
          !nodes[i].isSameNode(this.selImage)
        )
          img = nodes[i]
        else if (
          nodes[i].nodeName === 'DIV' &&
          !nodes[i].className &&
          !nodes[i].id
        )
          div = nodes[i]
        if (span && div && mainDiv) break
      }

      if (span || img) {
        const elem = img ? (img as HTMLElement) : (span as HTMLElement)
        const elemRect = elem.getBoundingClientRect()
        const insertPos =
          ev.clientX > elemRect.right ? elem.nextElementSibling : elem
        if (ev.clientX > elemRect.right) alert('right')
        elem.parentElement!.insertBefore(this.selImage, insertPos)
        if (elem.nodeName === 'IMG') {
          const newSpan = createNewElement('span')
          newSpan.innerHTML = '\u200b'
          elem.parentElement!.insertBefore(
            newSpan,
            this.selImage.nextElementSibling
          )
          this.select(newSpan.childNodes[0], 1)
        }
      } else if (div) div.append(this.selImage)
      else if (
        mainDiv &&
        mainDiv.lastElementChild &&
        mainDiv.lastElementChild?.nodeName === 'DIV' &&
        ev.clientY > mainDiv.lastElementChild.getBoundingClientRect().bottom
      ) {
        const newSpan = createNewElement('span')
        newSpan.innerHTML = '\u200b'
        mainDiv.lastElementChild.append(this.selImage)
        mainDiv.lastElementChild.append(newSpan)
        this.select(newSpan.childNodes[0], 1)
      }

      this.selImage.setAttribute(
        'style',
        this.selImage.getAttribute('data-defaultstyle')!
      )
      this.selImage.removeAttribute('data-mousedown')
    }

    if (!this.selTable || !this.selTable.getAttribute('data-selectable')) return

    this.selTable.removeAttribute('data-mousedown')

    this.hideSelRectangle()
    this.RectangleSelector.className = ''
    if (
      this.selTable.getAttribute('data-movingcells') &&
      !isEmpty(this.selectedCells)
    ) {
      const sortedRows = Object.keys(this.selectedCells).sort()

      const cells: HTMLElement[][] = []

      const rowsCopy = []

      for (let i = 0; i < sortedRows.length; i++) {
        const row = this.selectedCells[sortedRows[i]] as HTMLElement[]
        !cells.includes(row) && cells.push(row)
      }

      const addEventListeners = (cell: HTMLElement, table: HTMLElement) => {
        this.addCellMouseDown(cell, table)
        this.addCellMouseMove(cell, table)
      }

      const setCellAttr = (cell: HTMLElement, attr: string) => {
        cell.setAttribute(
          attr,
          this.selTable!.children[1].children[0].getAttribute(attr)!
        )
      }

      for (let i = 0; i < cells.length; i++) {
        const tr = createNewElement('tr')
        for (let j = 0; j < cells[i].length; j++) {
          const cell = cells[i][j]
          this.colorizeCell(cell, 'data-defaultcolor', false)
          const clonedCell = cell.cloneNode(true) as HTMLElement
          tr.append(clonedCell)
          if (clonedCell.nodeName === 'TH') {
            setCellAttr(clonedCell, 'data-defaultcolor')
            setCellAttr(clonedCell, 'data-selectcolor')
            setCellAttr(clonedCell, 'data-dragcolor')
            setCellAttr(clonedCell, 'style')
          }
        }
        tr.innerHTML = tr.innerHTML.replaceAll('<th', '<td')
        tr.innerHTML = tr.innerHTML.replaceAll('</th', '</td')
        rowsCopy.push(tr)
      }

      const tableRect = this.selTable.getBoundingClientRect()

      if (node.isSameNode(this.selfRef.current)) {
        if (ev.clientY > tableRect.bottom) {
          ev.clientY >
          this.selfRef.current.lastElementChild.getBoundingClientRect().bottom
            ? (node = this.selfRef.current.lastElementChild as HTMLElement)
            : (node = this.selTable)
        } else if (
          ev.clientY <= tableRect.bottom &&
          ev.clientY >= tableRect.top
        )
          node = this.selTable
        else {
          node =
            ev.clientY <
            this.selfRef.current.firstElementChild.getBoundingClientRect().top
              ? (this.selfRef.current.firstElementChild as HTMLElement)
              : node
        }
      }

      const insertPos = node.isSameNode(this.selTable)
        ? ev.clientX >= tableRect.left && ev.clientX <= tableRect.right
          ? ev.clientY <= tableRect.top
            ? 'intable-top'
            : 'intable-bottom'
          : ev.clientX >= tableRect.right
          ? 'intable-right'
          : 'intable-left'
        : 'between-divs'

      if (node?.nodeName === 'SPAN') node = node.parentNode as HTMLElement

      const tableRowSpan = [
        0,
        ...[].slice.call(this.selTable.children[0].children)
      ].reduce((a: number, c: HTMLTableDataCellElement) => a + c.rowSpan)

      if (insertPos === 'intable-left' || insertPos === 'intable-right') {
        for (let i = 0; i < rowsCopy.length; i++) {
          let colNumber = rowsCopy[i].childElementCount
          for (let j = 0; j < colNumber; j++) {
            const child = this.selTable.children[i]
            const fn =
              insertPos === 'intable-right'
                ? (elem: Element) => {
                    child.append(elem)
                    return child.lastElementChild as HTMLTableCellElement
                  }
                : (elem: Element) => {
                    child.prepend(elem)
                    return child.firstElementChild as HTMLTableCellElement
                  }

            const newCell = fn(rowsCopy[i].children[0])
            if (i == rowsCopy.length - 1) newCell.rowSpan = tableRowSpan
            addEventListeners(newCell, this.selTable)
          }
        }
      } else if (
        insertPos === 'intable-top' ||
        insertPos === 'intable-bottom'
      ) {
        let tableColsSpan = [
          0,
          ...[].slice.call(this.selTable.children[0].children)
        ].reduce((a: number, c: HTMLTableDataCellElement) => a + c.colSpan)

        for (let i = 0; i < rowsCopy.length; i++) {
          this.selTable.insertBefore(
            rowsCopy[i],
            insertPos === 'intable-bottom'
              ? this.selTable.lastElementChild!.nextElementSibling
              : this.selTable.firstElementChild
          )

          let colNumber = rowsCopy[i].childElementCount
          let totalSpan = 0

          for (let j = 0; j < colNumber; j++) {
            let colSpan = Math.ceil(tableColsSpan / colNumber)
            totalSpan += colSpan
            const cell = rowsCopy[i].children[j] as HTMLTableDataCellElement

            for (
              let k = 0;
              totalSpan >= tableColsSpan && j < colNumber - 1;
              k++
            ) {
              const cell = rowsCopy[i].children[k] as HTMLTableDataCellElement
              cell.colSpan--
              totalSpan--
            }

            cell.colSpan = colSpan
            addEventListeners(cell, this.selTable)
          }
        }
      } else if (
        node?.nodeName === 'DIV' &&
        node.parentElement === this.selfRef.current
      ) {
        const newTable = this.selTable.cloneNode(false) as HTMLElement
        for (let i = 0; i < rowsCopy.length; i++) newTable.append(rowsCopy[i])
        this.selfRef.current.insertBefore(newTable, node.nextElementSibling)
        this.select(
          newTable.children[0].children[0].children[0].children[0]
            .childNodes[0],
          1
        )
        ev.preventDefault()
        for (let i = 0; i < newTable.children.length; i++)
          for (let j = 0; j < newTable.children[i].children.length; j++)
            addEventListeners(
              newTable.children[i].children[j] as HTMLElement,
              newTable
            )
        this.selTable = newTable
      }

      this.clearSelecedCells()
      this.selTable.removeAttribute('data-movingcells')
    }
  }

  hideSelRectangle() {
    this.RectangleSelector.hidden = true
    this.RectangleSelector.className = ''
  }

  clearSelecedCells() {
    this.selectedCells = {}
  }

  onMouseMove = (e: React.MouseEvent) => {
    const selectable =
      this.selTable && this.selTable.getAttribute('data-selectable')
    if (!selectable) return

    if (!this.selTable!.getAttribute('data-movingcells')) {
      if (!this.RectangleSelector.className) return
      this.RectangleSelector.hidden = false
      let table = this.selTable
      const selCRect = this.RectangleSelector.getBoundingClientRect()
      this.clearSelecedCells()

      if (!table) {
        return
      }

      for (let i = 0; i < table.children.length; i++)
        for (let j = 0; j < table.children[i].children.length; j++) {
          const cell = table.children[i].children[j] as HTMLElement
          const rect = cell.getBoundingClientRect()
          if (
            ((rect.right > selCRect.left && rect.left < selCRect.left) ||
              (rect.left > selCRect.left && rect.right < selCRect.right) ||
              (rect.left < selCRect.right && rect.right > selCRect.right)) &&
            ((rect.top > selCRect.top && rect.bottom < selCRect.bottom) ||
              (rect.top < selCRect.bottom && rect.bottom > selCRect.bottom) ||
              (rect.bottom > selCRect.top && rect.top < selCRect.top))
          ) {
            const addToSelectedCells = (selObj: any, pushObj: any) => {
              selObj[rect.top] = selObj[rect.top]
                ? [...selObj[rect.top], pushObj]
                : [pushObj]
            }

            addToSelectedCells(
              this.selectedCells,
              table.children[i].children[j]
            )

            this.colorizeCell(cell, 'data-selectcolor', true)
          } else {
            this.colorizeCell(cell, 'data-defaultcolor', false)
          }
        }

      this.selRectangleCoords.x2 = e.pageX
      this.selRectangleCoords.y2 = e.pageY
      this.makeSelectRect()
    } else {
      this.hideSelRectangle()
      const rowsKeys = Object.keys(this.selectedCells)
      for (let i = 0; i < rowsKeys.length; i++) {
        const row = this.selectedCells[rowsKeys[i]]
        for (let j = 0; j < row.length; j++)
          this.colorizeCell(row[j], 'data-dragcolor', true)
      }
    }
  }

  colorizeCell = (cell: HTMLElement, property: string, select: boolean) => {
    cell.style.backgroundColor = cell.getAttribute(property)!
    cell.className = !select ? '' : 'selected'
  }

  onKeyDown = (e: React.KeyboardEvent) => {
    const date = new Date()

    if (
      this.lastKeyPressedDate &&
      this.lastKeyPressed &&
      date!.getTime() - this.lastKeyPressedDate.getTime() < 100
    ) {
      this.props.setCaretDelay('0ms')
    } else {
      this.props.resetCaretDelay()
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
      this.props.setCaretPos({
        left:
          this.props.caretPos.left +
          (RegExp('[A-Za-z0-9]').test(e.key) ? 4 : 1),
        top: this.props.caretPos.top
      })
    }

    this.lastKeyPressed = e.key
    this.lastKeyPressedDate = date

    const sel = window.getSelection()

    if (
      this.selAll &&
      (this.selAll = false) &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.shiftKey
    ) {
      this.selfRef.current.innerHTML = '<div></div>'
      this.init()
      this.selAll = false
    }

    switch (e.key) {
      case this.selTable &&
        (sel?.anchorOffset === 0 ||
          (sel?.anchorOffset === 1 &&
            this.currentChild.innerHTML === '\u200b')) &&
        'ArrowLeft': {
        const prevCell = this.currentChild.parentElement!.parentElement!
          .previousElementSibling?.lastElementChild!.lastElementChild!
          .childNodes[0] as CharacterData
        const prevUpCell = this.currentChild.parentElement!.parentElement!
          .parentElement!.previousElementSibling?.lastElementChild!
          .lastElementChild!.lastElementChild!.childNodes[0] as CharacterData
        if (prevCell) this.select(prevCell, prevCell.data.length)
        else if (prevUpCell) this.select(prevUpCell, prevUpCell.data.length)
        e.preventDefault()
        break
      }
      case this.selTable && 'Tab':
      case this.selTable && 'ArrowRight': {
        if (
          sel?.anchorOffset === this.currentChild.innerHTML.length ||
          (sel?.anchorOffset === 1 && this.currentChild.innerHTML === '\u200b')
        ) {
          const nextCell = this.currentChild.parentElement!.parentElement!
            .nextElementSibling?.lastElementChild!.lastElementChild!
            .childNodes[0] as CharacterData
          const nextDownCell = this.currentChild.parentElement!.parentElement!
            .parentElement!.nextElementSibling?.firstElementChild!
            .lastElementChild!.lastElementChild!.childNodes[0] as CharacterData
          const selCell = nextCell
            ? nextCell
            : nextDownCell
            ? nextDownCell
            : (this.selTable!.firstElementChild!.firstElementChild!
                .lastElementChild!.lastElementChild!
                .childNodes[0] as CharacterData)
          this.select(selCell, selCell.data.length)
          e.preventDefault()
        }
        break
      }
      case 'ArrowUp': {
        let cellRect = this.currentChild.parentElement!.parentElement!.getBoundingClientRect()
        const prevUpCellTop = cellRect.top
        let prevUpCell: any = document.elementFromPoint(
          cellRect.left + 5,
          prevUpCellTop - 5
        )!

        const selCell =
          prevUpCell.nodeName === 'SPAN'
            ? prevUpCell.childNodes[0]
            : prevUpCell.lastElementChild.childNodes[0]

        this.select(selCell, selCell.data.length)

        e.preventDefault()
        break
      }
      case 'ArrowDown': {
        let cellRect = this.currentChild.parentElement!.parentElement!.getBoundingClientRect()
        const nextDownCellBottom = cellRect.bottom
        let nextDownCell: any = document.elementFromPoint(
          cellRect.left + 5,
          nextDownCellBottom + 5
        )
        const selCell =
          nextDownCell.nodeName === 'SPAN'
            ? (nextDownCell = nextDownCell.childNodes[0])
            : nextDownCell.lastElementChild.childNodes[0]
        this.select(selCell, selCell.data.length)
        e.preventDefault()
        break
      }

      // handle backspace in front of normal lines
      case !this.onList &&
        this.currentChild.innerText.length === 1 &&
        this.currentChild.innerText !== '\u200b' &&
        'Backspace':
        this.currentChild.innerHTML = '\u200b'
        this.select(this.currentChild.childNodes[0], 1)

        e.preventDefault()
        break

      case !this.onList &&
        this.currentChild.innerText === '\u200b' &&
        'Backspace':
        if (
          (this.currentDiv.isSameNode(
            this.selfRef.current.firstElementChild.nextElementSibling
          ) &&
            this.currentChild.isSameNode(this.currentDiv.firstElementChild!)) ||
          this.selTable !== null
        ) {
          e.preventDefault()
        } else {
          this.currentChild.remove()
          this.currentDiv.previousElementSibling!.append('\u200b')
        }
        break

      case this.onList &&
        sel!.anchorOffset == 0 &&
        sel!.focusOffset == 0 &&
        'Backspace':
      case this.onList &&
        this.currentChild.innerText === '\u200b' &&
        'Backspace':
        if (this.currentDiv.nodeName === 'LI') {
          const newDiv = createNewElement('div')
          newDiv.innerHTML = this.currentDiv.innerHTML
          this.currentDiv.parentElement!.insertBefore(newDiv, this.currentDiv)
          this.currentDiv.remove()
          this.currentDiv = newDiv
          this.currentChild = this.currentDiv.firstElementChild! as HTMLElement
          this.select(this.currentChild.childNodes[0], 0)
        } else {
          const oldList = this.currentDiv.parentElement!
          const newList = oldList.cloneNode() as HTMLElement

          let oldListElems = []

          let elem = this.currentDiv.nextElementSibling! as HTMLElement
          while (elem !== null) {
            oldListElems.push(elem)
            elem = elem.nextSibling! as HTMLElement
          }

          oldListElems.forEach((elem) => newList.append(elem))

          this.selfRef.current.insertBefore(
            newList,
            oldList!.nextElementSibling
          )
          this.selfRef.current.insertBefore(this.currentDiv, newList)

          if (!newList.hasChildNodes()) newList.remove()
          if (!oldList.hasChildNodes()) oldList.remove()

          this.select(this.currentDiv.children[0].childNodes[0], 0)
          this.update()
          this.props.setCaretPos(this.getCaretPos())
        }
        e.preventDefault()
        break
      case e.ctrlKey && 'z':
      case e.ctrlKey && 'Z':
        this.commitChanges('back')
        e.preventDefault()
        break
      case e.ctrlKey && 'y':
      case e.ctrlKey && 'Y':
        this.commitChanges('forward')
        e.preventDefault()
        break
      case e.ctrlKey && 'v':
      case e.ctrlKey && 'V':
        this.lastCombPressed === 'ctrl+v' && e.preventDefault()
        this.lastCombPressed = 'ctrl+v'
        setTimeout(() => {
          this.lastCombPressed = ''
        }, 400)
        break
      case 'Enter':
        this.addToHistory()

        const newDiv =
          (this.currentDiv.nodeName === 'DIV' && !this.onList) || e.shiftKey
            ? createNewElement('div')
            : createNewElement('li')
        const newSpan = createNewElement('span')
        newSpan.setAttribute('style', this.currentChild.getAttribute('style')!)

        if (this.isRanged()) {
          const selElems = this.getChildsWithinSelect(sel!, true)!

          const selDivs = selElems[0] as HTMLElement[]
          const selDivsTrimCopy = selDivs.slice(1, -1)

          const selChilds = selElems[1] as HTMLElement[]
          const selChildsTrimCopy = selChilds.slice(1, -1)

          selChildsTrimCopy.forEach((child) => {
            child.remove()
          })

          selDivsTrimCopy.forEach((div) => {
            div.remove()
          })

          const startOffset = Math.min(sel!.anchorOffset, sel!.focusOffset)
          const endOffset = Math.max(sel!.anchorOffset, sel!.focusOffset)

          const text =
            selChilds.length === 1 && selChilds[0].innerText.slice(endOffset)
              ? selChilds[0].innerText.slice(endOffset)
              : '\u200b'

          selChilds[0].innerText = selChilds[0].innerText.substring(
            0,
            startOffset
          )
          selChilds[selChilds.length - 1].innerText =
            selChilds.length === 1
              ? selChilds[0].innerText
              : selChilds[selChilds.length - 1].innerText.slice(endOffset)

          newSpan.innerText = text
        } else {
          newSpan.innerText = this.currentChild.innerText.slice(
            sel!.anchorOffset
          )
            ? this.currentChild.innerText.slice(sel!.anchorOffset)
            : '\u200b'
          this.currentChild.innerText = this.currentChild.innerText.slice(
            0,
            sel!.anchorOffset
          )
        }

        newDiv.append(newSpan)
        this.currentDiv.parentElement!.insertBefore(
          newDiv,
          this.currentDiv.nextSibling
        )
        this.props.setCaretDelay('0ms')
        this.props.setIsCaretHidden(false)
        this.select(newSpan.childNodes[0], +(newSpan.innerText.length === 1))
        e.preventDefault()
        break
      case e.ctrlKey && 'A':
      case e.ctrlKey && 'a':
        this.addToHistory()
        this.selAll = true
        break
      default:
    }
  }

  onKeyUp = () => {
    this.lastCombPressed = ''
  }

  onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()

    let text = e.clipboardData.getData('text/plain')

    let textArr = text.split(/\r?\n/)

    this.currentChild.innerHTML += textArr[0] ? textArr[0] : '\u200b'
    textArr.splice(0, 1)
    for (let str of textArr) {
      const div = createNewElement('div')
      const child = createNewElement('span')
      child.innerHTML = str ? str : '\u200b'
      div.append(child)
      this.selfRef.current.insertBefore(div, this.currentDiv.nextElementSibling)
      this.currentDiv = div
      this.currentChild = child
    }

    this.select(
      this.currentChild.childNodes[0],
      this.currentChild.innerText.length
    )
    this.commitChanges()
  }

  onSelect = () => {
    this.update()

    this.props.fontSizeMenu === null &&
      this.props.fontSizeMenu.setState({
        fontSize: parseInt(
          this.currentChild.style.fontSize
            ? this.currentChild.style.fontSize
            : this.props.defaultFontSize
        )
      })

    this.setCaretHeight(this.currentChild.style.fontSize)
    this.currentDiv.style.lineHeight =
      !this.currentDiv.style.lineHeight ||
      parseInt(this.currentChild.style.fontSize) >
        parseInt(this.currentDiv.style.lineHeight)
        ? this.currentChild.style.fontSize
        : this.currentDiv.style.lineHeight

    this.props.setCaretPos(this.getCaretPos())
  }

  makeSelectRect = () => {
    let x1 = Math.min(this.selRectangleCoords.x1, this.selRectangleCoords.x2)
    let x2 = Math.max(this.selRectangleCoords.x1, this.selRectangleCoords.x2)
    let y1 = Math.min(this.selRectangleCoords.y1, this.selRectangleCoords.y2)
    let y2 = Math.max(this.selRectangleCoords.y1, this.selRectangleCoords.y2)
    this.RectangleSelector.style.left = x1 + 'px'
    this.RectangleSelector.style.top = y1 + 'px'
    this.RectangleSelector.style.width = x2 - x1 + 'px'
    this.RectangleSelector.style.height = y2 - y1 + 'px'
  }

  getChildsWithinSelect = (sel: Selection, withDivs = false) => {
    let nodesWithinEnds = this.getNodesFromSelectEnds(sel)

    if (sel.anchorOffset > sel.focusOffset)
      nodesWithinEnds = nodesWithinEnds.reverse()

    const divs: HTMLElement[] = []
    const childs: HTMLElement[] = []

    if (nodesWithinEnds[0] === null || nodesWithinEnds[1] === null) {
      alert('nodesWithinSelect is null')
      return
    }

    let cDiv = nodesWithinEnds[0][0] as HTMLElement | null
    let cChild = nodesWithinEnds[0][1] as HTMLElement | null

    if (cDiv === null || cChild === null) {
      alert('cChild or cDiv is null')
      return
    }

    while (cDiv !== null) {
      divs.push(cDiv)

      while (cChild !== null) {
        childs.push(cChild)
        if (cChild.isSameNode(nodesWithinEnds[1][1])) {
          cDiv = null
          break
        }
        cChild = cChild.nextElementSibling as HTMLElement
      }

      cDiv = cDiv && (cDiv.nextElementSibling as HTMLElement)
      cChild = cDiv ? (cDiv.firstElementChild as HTMLElement) : null
    }

    return withDivs ? [divs, childs] : childs
  }

  replaceSelectedTextChildsWith = (
    conditionNames: string[],
    ifTrue: string,
    ifNot: string
  ) => {
    const sel = window.getSelection()!
    const selChilds = this.getChildsWithinSelect(sel)! as HTMLElement[]
    const startOffset = Math.min(sel.anchorOffset, sel.focusOffset)
    const endOffset = Math.max(sel.anchorOffset, sel.focusOffset)
    let startElem: Node
    const initNodeName = selChilds[0].nodeName
    let isAllSameTag = true

    for (let child of selChilds) {
      if (
        [...conditionNames, ifTrue.toUpperCase()].includes(child.nodeName) &&
        child.nodeName !== initNodeName
      ) {
        isAllSameTag = false
        alert('not all same tag')
        break
      }
    }

    selChilds.forEach((child, index) => {
      if (
        child.nodeName === 'SPAN' ||
        child.nodeName === 'SUP' ||
        child.nodeName === 'SUB'
      ) {
        const elem = createNewElement(
          !isAllSameTag
            ? ifTrue
            : child.nodeName.toLowerCase() === ifTrue
            ? ifNot
            : ifTrue
        )
        elem.setAttribute('style', child.getAttribute('style')!)
        if (index === 0 && selChilds!.length === 1) {
          const textBefore = child.innerText.substring(0, startOffset)
          const text = child.innerText.substring(startOffset, endOffset)
          const textAfter = child.innerText.slice(endOffset)
          child.innerText = textBefore
          elem.innerText = text
          child.parentElement!.insertBefore(elem, child.nextElementSibling)
          if (textAfter) {
            const childAfter = child.cloneNode() as HTMLElement
            childAfter.innerText = textAfter
            child.parentElement!.insertBefore(
              childAfter,
              elem.nextElementSibling
            )
          }
          this.selectRange(
            elem.childNodes[0],
            0,
            elem.childNodes[0],
            elem.innerText.length
          )
        } else if (index === 0) {
          const text = child.innerText.slice(startOffset)
          child.innerText = child.innerText.substring(0, startOffset)
          elem.innerText = text
          child.parentElement!.insertBefore(elem, child.nextElementSibling)
          startElem = elem
        } else if (index === selChilds!.length - 1) {
          const text = child.innerText.substring(0, endOffset)
          child.innerText = child.innerText.slice(endOffset)
          elem.innerText = text
          child.parentElement!.insertBefore(elem, child)
          this.selectRange(
            startElem.childNodes[0],
            0,
            elem.childNodes[0],
            elem.innerText.length
          )
        } else {
          const text = child.innerText
          elem.innerText = text
          child.parentElement!.insertBefore(elem, child)
          child.remove()
        }
      }
    })
  }

  setSub = () => {
    this.addToHistory()

    this.isRanged()
      ? this.replaceSelectedTextChildsWith(['SPAN', 'SUP'], 'sub', 'span')
      : this.insertNewTextElement(
          this.currentChild.nodeName === 'SUB' ? 'span' : 'sub'
        )
    this.addToHistory()
  }

  setSup = () => {
    this.addToHistory()

    this.isRanged()
      ? this.replaceSelectedTextChildsWith(['SPAN', 'SUB'], 'sup', 'span')
      : this.insertNewTextElement(
          this.currentChild.nodeName === 'SUP' ? 'span' : 'sup'
        )
    this.addToHistory()
  }

  addList = (type: 'ul' | 'ol', css: string = '') => {
    this.addToHistory()

    const list = createNewElement(type)
    list.setAttribute('style', css)
    this.selfRef.current.insertBefore(list, this.currentDiv.nextElementSibling)
    if (this.isRanged()) {
      const sel = window.getSelection()!
      const selElems = this.getChildsWithinSelect(sel, true)!
      const selDivs = selElems[0] as HTMLElement[]
      for (let div of selDivs) {
        const li = createNewElement('li')
        li.innerHTML = div.innerHTML
        list.append(li)
        div.remove()
      }
      this.selectNode(list)
    } else {
      this.addListItem(list)
    }

    this.addToHistory()
  }

  addListItem = (list: HTMLElement) => {
    const li = createNewElement('li')
    const span = createNewElement('span')
    span.innerText = '\u200b'
    li.append(span)
    list.appendChild(li)
    this.select(span.childNodes[0], 1)
    this.currentDiv = list
    this.currentChild = span
  }

  insertNewTextElement = (type: 'span' | 'sub' | 'sup') => {
    const elem = createNewElement(type)
    elem.setAttribute('style', this.currentChild.getAttribute('style')!)
    elem.innerText = '\u200b'
    this.currentDiv.insertBefore(elem, this.currentChild.nextElementSibling)
    this.select(elem.childNodes[0], 1)
  }

  insertTable = (
    rows: number,
    cols: number,
    css: string = '',
    selectable: boolean = true
  ) => {
    if (!this.nextMainCurrentDiv) {
      const div = createNewElement('div')
      const span = createNewElement('span')
      span.innerHTML = '\u200b'
      div.appendChild(span)
      this.selfRef.current.appendChild(div)
      this.nextMainCurrentDiv = div as HTMLElement
    }

    const tableWidth = this.currentDiv.getBoundingClientRect().width
    const cellHeight = this.props.caretHeight
    const nextDiv = this.nextMainCurrentDiv

    const cssArr = parseCSS(css)
    const insertRuleIfNotFound = (
      index: number,
      key: string,
      value: string,
      selector: any = false
    ) => {
      if (!cssArr[index].rules.includes(key)) {
        css =
          css +
          `
            ${selector ? selector + '{' : ''}
            ${key}:${value};
            ${selector ? '}' : ''}
          `
        cssArr[index].rules.push({ key, value })
      }
    }

    const makeSureKeyExist = (index: number, key: string) => {
      if (index === -1) {
        cssArr.push({ selector: key, rules: [] })
      }
      return index === -1 ? cssArr.length - 1 : index
    }

    const tableStrIndex = css.indexOf('table')
    const lastPara = css.indexOf('}', tableStrIndex)
    if (tableStrIndex !== -1) {
      css =
        css.slice(0, tableStrIndex) +
        css.slice(tableStrIndex + 6, lastPara) +
        css.slice(lastPara + 1)
    }

    let tableIndex = -1
    let tdIndex = -1
    let thIndex = -1

    for (let i = 0; i < cssArr.length; i++) {
      if (cssArr[i].selector === 'table') tableIndex = i
      else if (cssArr[i].selector === 'td') tdIndex = i
      else if (cssArr[i].selector === 'th') thIndex = i
    }

    tableIndex = makeSureKeyExist(tableIndex, 'td')
    tdIndex = makeSureKeyExist(tdIndex, 'td')
    thIndex = makeSureKeyExist(thIndex, 'th')

    insertRuleIfNotFound(tableIndex, 'table-layout', 'fixed')
    insertRuleIfNotFound(tableIndex, 'margin', '5px')
    insertRuleIfNotFound(tableIndex, 'border-collapse', 'collapse')

    const colWidth = rows > 1 || cols > 1 ? tableWidth / (cols + 1) : 200

    insertRuleIfNotFound(tdIndex, 'width', `${colWidth}px`, 'td')
    insertRuleIfNotFound(thIndex, 'width', `${colWidth}px`, 'th')
    insertRuleIfNotFound(tdIndex, 'font-size', `${cellHeight}`, 'td')
    insertRuleIfNotFound(thIndex, 'font-size', `${cellHeight}`, 'th')
    insertRuleIfNotFound(tdIndex, 'max-width', `${colWidth}px`, 'td')
    insertRuleIfNotFound(tdIndex, 'word-break', 'break-all', 'td')
    insertRuleIfNotFound(tdIndex, 'white-space', 'pre-wrap', 'td')
    insertRuleIfNotFound(tdIndex, 'text-align', 'center', 'td')
    insertRuleIfNotFound(tdIndex, 'border', 'thin solid #5e646e70', 'th')
    insertRuleIfNotFound(tdIndex, 'border', 'thin solid #9ba4b470', 'td')
    insertRuleIfNotFound(thIndex, 'background-color', '#ebecf1', 'th')
    insertRuleIfNotFound(thIndex, 'font-weight', 'normal', 'th')

    if (selectable) {
      insertRuleIfNotFound(thIndex, 'background-color', '#d2d3c970', 'th')
      insertRuleIfNotFound(tdIndex, 'background-color', '#ffffff', 'td')
      insertRuleIfNotFound(thIndex, 'select-color', '#5a868370', 'th')
      insertRuleIfNotFound(tdIndex, 'select-color', '#68b0ab50', 'td')
      insertRuleIfNotFound(tdIndex, 'drag-color', '#4ba4bb70', 'td')
      insertRuleIfNotFound(thIndex, 'drag-color', '#3b666870', 'th')
    }

    let tdDefaultStyle: any = {}
    let thDefaultStyle: any = {}

    const tdRules = cssArr[tdIndex].rules
    const thRules = cssArr[thIndex].rules
    for (let i = 0; i < tdRules.length; i++) {
      tdDefaultStyle[tdRules[i].key] = tdRules[i].value
    }
    for (let i = 0; i < thRules.length; i++) {
      thDefaultStyle[thRules[i].key] = thRules[i].value
    }

    const Table = styled.table`
      ${css}
    `

    let table = createElementFromHTML(
      ReactDOMServer.renderToStaticMarkup(<Table />)
    )

    if (selectable) table.setAttribute('data-selectable', 'true')

    nextDiv.parentElement!.insertBefore(table, nextDiv)

    for (let i = 0; i < rows; i++) {
      const tr = createNewElement('tr')
      table.appendChild(tr)

      for (let j = 0; j < cols; j++) {
        const cell = i === 0 ? createNewElement('th') : createNewElement('td')

        const div = createNewElement('div')
        const span = createNewElement('span')

        if (selectable) {
          cell.setAttribute(
            'data-selectcolor',
            i === 0
              ? thDefaultStyle['select-color']
              : tdDefaultStyle['select-color']
          )
          cell.setAttribute(
            'data-dragcolor',
            i === 0
              ? thDefaultStyle['drag-color']
              : tdDefaultStyle['drag-color']
          )
          cell.setAttribute(
            'data-defaultcolor',
            i === 0
              ? thDefaultStyle['background-color']
              : tdDefaultStyle['background-color']
          )
        }

        div.contentEditable = 'true'
        span.innerHTML = '\u200b'
        tr.appendChild(cell)
        cell.appendChild(div)
        div.appendChild(span)
      }
    }

    for (let i = 0; i < table.children.length; i++)
      for (let cell of [].slice.call(table.children[i].children)) {
        this.addCellMouseDown(cell, table)
        this.addCellMouseMove(cell, table)
      }

    this.currentDiv = table.firstElementChild!.firstElementChild!
      .firstElementChild! as HTMLElement
    this.currentChild = table.firstElementChild!.firstElementChild!
      .firstElementChild!.firstElementChild! as HTMLElement

    this.select(this.currentChild, 1)

    this.commitChanges()
  }

  insertImage = (
    src: string,
    css = '',
    selectCss = 'opacity: 0.5;border:1.5px dashed grey;',
    autoResize = true
  ) => {
    const Image = styled.image`
      ${css}
    `

    const img = createElementFromHTML(
      ReactDOMServer.renderToStaticMarkup(<Image />)
    ) as HTMLImageElement

    img.src = src

    img.addEventListener('mousedown', (ev: MouseEvent) => {
      if (ev.button !== 0) return
      this.selImage = img
      img.setAttribute('data-mousedown', 'true')
      this.currentDiv = img.parentElement as HTMLElement
      this.currentChild = img.nextElementSibling as HTMLElement
      this.props.setIsCaretHidden(true)
      // img.style.float = 'left'
      this.update()
      this.props.setCaretPos(this.getCaretPos())

      ev.preventDefault()
    })

    img.addEventListener('mousemove', (ev: MouseEvent) => {
      if (img.hasAttribute('data-mousedown')) {
        img.setAttribute('style', img.getAttribute('data-selectstyle')!)
        img.style.position = 'absolute'
        img.style.transform = `translate(-50%, -50%)`
        img.style.top = `${ev.pageY}px`
        img.style.left = ` ${ev.pageX}px`
        img.style.cursor = 'grabbing'
        const selfRect = this.selfRef.current.getBoundingClientRect()
        if (
          ev.clientX > selfRect.right ||
          ev.clientX < selfRect.left ||
          ev.clientY > selfRect.bottom ||
          ev.clientY < selfRect.top
        ) {
          img.setAttribute('style', img.getAttribute('data-defaultstyle')!)
          img.removeAttribute('data-mousedown')
          this.selImage = null
        }
      }
    })

    const divRect = this.currentDiv.getBoundingClientRect()
    const mainRect = this.selfRef.current.getBoundingClientRect()

    if (autoResize && img.width > divRect.width) {
      img.style.width = `${divRect.width}px`
      img.style.height = 'auto'
    } else if (autoResize && img.height > mainRect.height) {
      img.style.height = `${mainRect.height}px`
      img.style.width = 'auto'
    }

    const selectCssObj = stringToCssObj(selectCss)
    selectCssObj['width'] = !('width' in selectCssObj)
      ? img.style.width
      : selectCssObj['width']

    selectCssObj['height'] = !('height' in selectCssObj)
      ? img.style.height
      : selectCssObj['height']

    selectCss = cssObjToString(selectCssObj)
    img.setAttribute('data-selectstyle', selectCss)
    img.setAttribute('data-defaultstyle', img.getAttribute('style')!)

    const spanAfter = createNewElement('span')

    spanAfter.innerText = '\u200b'

    this.currentDiv.append(img)
    this.currentDiv.append(spanAfter)

    this.select(spanAfter.childNodes[0], 1)
    this.currentChild = spanAfter
    this.commitChanges()
  }

  deleteSelectedImage = () => {
    this.selImage?.remove()
    this.update()
    this.props.setCaretPos(this.getCaretPos())

    this.props.setIsCaretHidden(false)
  }

  addCellMouseDown(cell: HTMLElement, table: HTMLElement) {
    cell.addEventListener('mousedown', (e: MouseEvent) => {
      const selectable = table.getAttribute('data-selectable')

      this.props.setIsCaretHidden(false)

      table.setAttribute('data-mousedown', 'true')

      if (!isEmpty(this.selectedCells) && cell.className === 'selected') {
        document.body.style.cursor = 'copy'
        e.preventDefault()
        table.setAttribute('data-movingcells', 'true')
      } else if (selectable) {
        document.body.style.cursor = 'text'
        this.RectangleSelector.className = 'sel'
        this.selTable = table
        this.selRectangleCoords.x1 = e.pageX
        this.selRectangleCoords.y1 = e.pageY

        this.resetCells()

        this.makeSelectRect()
        table.removeAttribute('data-movingcells')
      }
    })
  }

  addCellMouseMove(cell: HTMLElement, table: HTMLElement) {
    cell.addEventListener('mousemove', () => {
      if (
        this.selTable &&
        (table.getAttribute('data-movingcells') ||
          table.getAttribute('data-mousedown'))
      ) {
        this.select(cell.lastElementChild!.lastElementChild!.childNodes[0], 1)
        this.props.setIsCaretHidden(true)
      }
    })
  }

  resetCells = () => {
    const rowsKeys = Object.keys(this.selectedCells)

    for (let i = 0; i < rowsKeys.length; i++) {
      const row = this.selectedCells[rowsKeys[i]] as HTMLElement[]
      for (let j = 0; j < row.length; j++) {
        const cell = row[j]
        cell.style.backgroundColor = cell.getAttribute('data-defaultcolor')!
        cell.className = ''
      }
    }

    this.selectedCells = []
  }

  onMouseDown = (e: React.MouseEvent) => {
    this.props.setCaretDelay('0ms')
    const elems = document.elementsFromPoint(e.clientX, e.clientY)

    const img = elems.find((elem) => elem.nodeName === 'IMG')
    const table = elems.find((elem) => elem.nodeName === 'TABLE')

    if (this.selTable && (!table || !this.selTable.isSameNode(table))) {
      this.props.setIsCaretHidden(false)
      this.selTable = null
      this.resetCells()
    }

    if (this.selImage && !img) {
      this.selImage = null
      this.props.setIsCaretHidden(false)
    }
  }

  onMouseLeave = () => {
    document.body.style.cursor = 'auto'
  }

  render() {
    return (
      <ContentEditable
        onPaste={this.onPaste}
        padding={this.props.padding}
        onInput={() => this.onInput()}
        onFocus={() => {
          this.props.setCaretDelay('0ms')
          this.onInput()
        }}
        onBlur={() => this.onInput(true)}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.onMouseLeave}
        onMouseUp={this.onMouseUp}
        onMouseDown={this.onMouseDown}
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
        onSelect={this.onSelect}
        ref={this.selfRef}
        onDragEnter={(e: React.DragEvent) => {
          e.preventDefault()
        }}
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault()
        }}
        onDrag={(e: React.DragEvent) => {
          e.preventDefault()
        }}
        onDragStart={(e: React.DragEvent) => {
          e.preventDefault()
        }}
        dir='auto'
        contentEditable
        dangerouslySetInnerHTML={{ __html: this.props.html }}
        caretColor={this.props.caretColor}
        disableSmoothCaret={this.props.disableSmoothCaret}
        css={this.props.css}
      />
    )
  }
}

export default Editor
