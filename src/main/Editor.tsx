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
import isEmpty from 'lodash.isempty'

class Editor extends React.Component<EditorProps> {
  public selfRef: any = React.createRef()
  public currentDiv: Element
  public nextMainCurrentDiv: HTMLElement | null
  public currentChild: HTMLElement
  private lastCurrentChild: HTMLElement
  private defaultCss = `color:${this.props.defaultTextColor};font-size:${this.props.defaultFontSize};`
  private cssSet: any = []
  private onTable = false
  private wasOnTable = false
  private mouseDown = false
  private selTable: HTMLElement
  private selTabelCellStyles: string[][] = []
  private isMovingRows = false
  private selectedCells: any = {}
  private selRectangle: HTMLElement
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
    this.selRectangle = this.createNewElement('div')
    this.selRectangle.hidden = true
    this.selRectangle.style.position = 'absolute'
    this.selRectangle.draggable = false
    this.selfRef.current.prepend(this.selRectangle)
  }

  shouldComponentUpdate() {
    return false
  }

  // This may produce some propblems, especially with tables
  setCurrentElements() {
    const sel = window.getSelection()
    if (!sel) return
    const node = sel.anchorNode
    if (!node) return
    const nodeName = node.nodeName
    const parentNode = node.parentNode!
    const parentName = parentNode.nodeName

    this.currentDiv =
      parentNode.nodeName === 'SPAN'
        ? (parentNode.parentNode as Element)
        : node.nodeName === 'SPAN'
        ? (node.parentNode as Element)
        : (node as Element)

    if (nodeName === 'SPAN') {
      this.currentDiv = parentNode as HTMLElement
      this.currentChild = node as HTMLElement
    } else if (nodeName === '#text') {
      this.currentDiv = parentNode.parentElement as HTMLElement
      this.currentChild = parentNode as HTMLElement
    } else if (nodeName === 'IMG') alert('IMG')
    else if (nodeName === 'TD') {
      this.currentDiv = (node as HTMLElement).firstElementChild! as HTMLElement
      this.currentChild = this.currentDiv.firstElementChild! as HTMLElement
    } else if (parentName === 'TD') {
      this.currentDiv = node as HTMLElement
      this.currentChild = this.currentDiv.firstElementChild! as HTMLElement
    } else if (nodeName === 'TABLE') {
      this.currentDiv = (node as HTMLElement).firstElementChild!.firstElementChild!.firstElementChild!
      this.currentChild = this.currentDiv.firstElementChild! as HTMLElement
    } else if (
      nodeName === 'DIV' &&
      (node as HTMLElement).firstElementChild?.nodeName === 'DIV'
    ) {
      this.currentDiv = (node as HTMLElement).firstElementChild!
      this.currentChild = this.currentDiv.firstElementChild! as HTMLElement
    } else if (
      nodeName === 'DIV' &&
      (node as HTMLElement).firstElementChild?.nodeName === 'TABLE'
    ) {
      this.currentDiv = (node as HTMLElement).firstElementChild!.firstElementChild!.firstElementChild!.firstElementChild!
      this.currentChild = this.currentDiv.firstElementChild as HTMLElement
    } else return

    this.wasOnTable = this.onTable
    this.onTable =
      nodeName === 'TABLE' ||
      parentName === 'TABLE' ||
      parentNode.parentElement?.nodeName === 'TABLE' ||
      parentNode.parentElement?.parentElement?.nodeName === 'TABLE' ||
      parentNode.parentElement?.parentElement?.parentElement?.nodeName ===
        'TABLE' ||
      parentNode.parentElement?.parentElement?.parentElement?.parentElement
        ?.nodeName === 'TABLE'

    this.nextMainCurrentDiv = this.selTable
      ? (this.selTable.nextElementSibling as HTMLElement)
      : (this.currentDiv.nextElementSibling as HTMLElement)

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
    if (
      this.lastCurrentChild?.parentElement?.previousElementSibling?.nodeName !==
        'TABLE' &&
      !this.onTable &&
      !this.wasOnTable &&
      this.lastCurrentChild &&
      !this.lastCurrentChild.isSameNode(this.currentDiv.children[0]) &&
      !this.lastCurrentChild.isSameNode(this.currentChild) &&
      this.lastCurrentChild.innerHTML === '\u200b'
    ) {
      this.lastCurrentChild.remove()
      alert('rmv')
    }
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

  onMouseUp = (ev: React.MouseEvent) => {
    this.selRectangle.hidden = true
    if (this.isMovingRows && !isEmpty(this.selectedCells)) {
      const sortedRows = Object.keys(this.selectedCells).sort()
      const rows: HTMLElement[][] = []

      const rowsCopy = []

      for (let i = 0; i < sortedRows.length; i++) {
        const row = this.selectedCells[sortedRows[i]] as HTMLElement[]
        if (!rows.includes(row)) rows.push(row)
      }

      for (let i = 0; i < rows.length; i++) {
        const tr = this.createNewElement('tr')
        for (let j = 0; j < rows[i].length; j++) {
          const cell = rows[i][j]
          cell.setAttribute('style', this.selTabelCellStyles[i][j])
          const clonedCell = cell.cloneNode(true) as HTMLElement
          tr.append(clonedCell)
        }
        rowsCopy.push(tr)
      }

      let node = document.elementFromPoint(
        ev.clientX,
        ev.clientY
      )! as HTMLElement
      const isNextOfTable = node?.isSameNode(this.selTable.nextElementSibling)
      const isPrevOfTable = node?.isSameNode(
        this.selTable.previousElementSibling
      )

      if (node?.nodeName === 'SPAN') node = node.parentNode as HTMLElement

      if (isNextOfTable || isPrevOfTable) {
        let tableSpan = [
          0,
          ...[].slice.call(this.selTable.children[0].children)
        ].reduce((a: number, c: HTMLTableDataCellElement) => a + c.colSpan)

        for (let i = 0; i < rowsCopy.length; i++) {
          this.selTable.insertBefore(
            rowsCopy[i],
            isNextOfTable
              ? this.selTable.lastElementChild!.nextElementSibling
              : this.selTable.firstElementChild
          )
          this.selTabelCellStyles.splice(
            isNextOfTable ? this.selTabelCellStyles.length : 0,
            0,
            []
          )

          let colNumber = rowsCopy[i].childElementCount
          let totalSpan = 0

          for (let j = 0; j < colNumber; j++) {
            let colSpan = Math.ceil(tableSpan / colNumber)
            totalSpan += colSpan
            const col = rowsCopy[i].children[j] as HTMLTableDataCellElement
            this.selTabelCellStyles[i][j] = col.getAttribute('style')!

            for (let k = 0; totalSpan >= tableSpan && j < colNumber - 1; k++) {
              const col = rowsCopy[i].children[k] as HTMLTableDataCellElement
              col.colSpan--
              totalSpan--
            }

            col.colSpan = colSpan
          }
        }
      } else if (
        node?.nodeName === 'DIV' &&
        node.parentElement === this.selfRef.current
      ) {
        const newTable = this.createNewElement('table')
        for (let i = 0; i < rowsCopy.length; i++) newTable.append(rowsCopy[i])
        this.selfRef.current.insertBefore(newTable, node)
        newTable.setAttribute('style', this.selTable.getAttribute('style')!)
        this.select(
          newTable.children[0].children[0].children[0].children[0]
            .childNodes[0],
          1
        )
        ev.preventDefault()
      } else {
        console.error('next is unhandeled for dropping table')
        console.error(node)
      }

      document.body.style.cursor = 'auto'
      this.selectedCells = {}
      this.isMovingRows = false
    }
  }

  onMouseMove = (e: React.MouseEvent) => {
    if (!this.isMovingRows) {
      if (this.selRectangle.hidden) return
      let table = this.selTable
      const selCRect = this.selRectangle.getBoundingClientRect()
      this.selectedCells = {}

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
            cell.style.backgroundColor = 'red'
            this.selectedCells[rect.top] = this.selectedCells[rect.top]
              ? [...this.selectedCells[rect.top], cell]
              : [table.children[i].children[j]]
          } else {
            cell.style.backgroundColor = 'initial'
          }
        }

      this.selRectangleCoords.x2 = e.pageX
      this.selRectangleCoords.y2 = e.pageY
      this.makeSelectRect()
    }
  }

  onKeyDown = (_event: React.KeyboardEvent) => {}

  onSelect = () => {
    this.update()
  }

  makeSelectRect = () => {
    let x1 = Math.min(this.selRectangleCoords.x1, this.selRectangleCoords.x2)
    let x2 = Math.max(this.selRectangleCoords.x1, this.selRectangleCoords.x2)
    let y1 = Math.min(this.selRectangleCoords.y1, this.selRectangleCoords.y2)
    let y2 = Math.max(this.selRectangleCoords.y1, this.selRectangleCoords.y2)
    this.selRectangle.style.left = x1 + 'px'
    this.selRectangle.style.top = y1 + 'px'
    this.selRectangle.style.width = x2 - x1 + 'px'
    this.selRectangle.style.height = y2 - y1 + 'px'
  }

  insertTable = (rows: number, cols: number, css: string) => {
    console.log(this.mouseDown)
    const table = this.createNewElement('table')
    if (!this.nextMainCurrentDiv) {
      const div = this.createNewElement('div')
      const span = this.createNewElement('span')
      span.innerHTML = '\u200b'
      div.appendChild(span)
      this.selfRef.current.appendChild(div)
      this.nextMainCurrentDiv = div
    }
    this.selfRef.current.insertBefore(table, this.nextMainCurrentDiv)
    table.addEventListener('mousedown', (e: MouseEvent) => {
      if (!isEmpty(this.selectedCells)) {
        this.isMovingRows = true
        document.body.style.cursor = 'copy'
      } else {
        this.selRectangle.hidden = false
        this.selTable = table
        this.selRectangleCoords.x1 = e.pageX
        this.selRectangleCoords.y1 = e.pageY
        this.makeSelectRect()
      }
    })

    for (let i = 0; i < rows; i++) {
      const tr = this.createNewElement('tr')
      table.appendChild(tr)
      this.selTabelCellStyles.push([])
      table.style.borderCollapse = 'collapse'
      for (let j = 0; j < cols; j++) {
        const cell =
          i === 0 ? this.createNewElement('th') : this.createNewElement('td')

        cell.style.border = '1px solid black'
        cell.style.width = '10px'
        cell.style.height = '20px'
        cell.style.margin = '0'
        cell.style.textAlign = 'center'
        cell.style.fontWeight = 'normal'

        this.selTabelCellStyles[i][j] = cell.getAttribute('style')!

        const div = this.createNewElement('div')
        const span = this.createNewElement('span')
        span.innerHTML = '\u200b'
        tr.appendChild(cell)
        cell.appendChild(div)
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
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onKeyDown={this.onKeyDown}
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
        style={{ padding: 10, whiteSpace: 'pre-wrap' }}
        dir='auto'
        contentEditable
        dangerouslySetInnerHTML={{ __html: this.props.html }}
      />
    )
  }
}

export default Editor
