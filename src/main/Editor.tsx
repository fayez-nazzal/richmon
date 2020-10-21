import React from 'react'
import ReactDOMServer from 'react-dom/server'
import './style.css'
import assert from 'assert'
import { EditorProps } from './types'
import styled from 'styled-components'
import {
  cssObjToString,
  stringToCssObj,
  isBefore,
  isMatchingKeysEqual,
  createElementFromHTML
} from './richmonUtils'
import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import { parseCSS } from 'css-parser'

class Editor extends React.Component<EditorProps> {
  public selfRef: any = React.createRef()
  public currentDiv: HTMLElement
  public nextMainCurrentDiv: HTMLElement | null
  public currentChild: HTMLElement
  private defaultCss = `color:${this.props.defaultTextColor};font-size:${this.props.defaultFontSize};`
  private cssSet: any = []
  private selectedCells: any = {}
  private selTable: HTMLElement | null
  private selImage: HTMLImageElement | null
  private RectanleSelector: HTMLElement
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
    this.currentDiv = selfElem.children[0] as HTMLElement
    this.currentChild = this.createNewElement('span')
    this.currentChild.innerText = '\u200b'
    this.currentDiv.append(this.currentChild)
    this.currentChild.setAttribute('style', this.defaultCss)
    this.commitChanges()
    this.RectanleSelector = this.createNewElement('div')
    this.RectanleSelector.hidden = true
    this.RectanleSelector.style.position = 'absolute'
    this.RectanleSelector.style.border = '1px dashed #6C747680'
    this.RectanleSelector.style.backgroundColor = '#68b0ab50'
    this.RectanleSelector.style.pointerEvents = 'none'
    this.selfRef.current.prepend(this.RectanleSelector)
  }

  shouldComponentUpdate() {
    return false
  }

  // This may produce some propblems, especially with tables
  setCurrentElements() {
    const sel = window.getSelection()
    if (!sel) return
    const node = sel.anchorNode as HTMLElement
    if (!node) return

    const nodeName = node.nodeName
    const parentNode = node.parentNode!
    const parentName = parentNode.nodeName
    if (nodeName === 'SPAN') {
      this.currentDiv = parentNode as HTMLElement
      this.currentChild = node as HTMLElement
    } else if (nodeName === '#text') {
      this.currentDiv = parentNode.parentNode as HTMLElement
      this.currentChild = parentNode as HTMLElement
    } else if (nodeName === 'TD') {
      this.currentDiv = (node as HTMLElement).firstElementChild! as HTMLElement
      this.currentChild = this.currentDiv.firstElementChild! as HTMLElement
    } else if (parentName === 'TD') {
      this.currentDiv = node as HTMLElement
      this.currentChild = this.currentDiv.firstElementChild! as HTMLElement
    } else if (nodeName === 'TABLE') {
      this.currentDiv = (node as HTMLElement).firstElementChild!
        .firstElementChild!.firstElementChild! as HTMLElement
      this.currentChild = this.currentDiv.firstElementChild! as HTMLElement
    } else if (
      nodeName === 'DIV' &&
      (node as HTMLElement).firstElementChild?.nodeName === 'DIV'
    ) {
      this.currentDiv = (node as HTMLElement).firstElementChild! as HTMLElement
      this.currentChild = this.currentDiv.firstElementChild! as HTMLElement
    } else if (
      nodeName === 'DIV' &&
      (node as HTMLElement).firstElementChild?.nodeName === 'TABLE'
    ) {
      this.currentDiv = (node as HTMLElement).firstElementChild!
        .firstElementChild!.firstElementChild!.firstElementChild! as HTMLElement
      this.currentChild = this.currentDiv.firstElementChild as HTMLElement
    } else return

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

    if (this.currentDiv.innerHTML.includes('<br>')) {
      this.currentDiv.innerHTML = this.currentDiv.innerHTML.replace('<br>', '')
      if (this.currentDiv.children[0]) {
        this.currentDiv.children[0]!.innerHTML = '\u200b'
        this.select(this.currentDiv.children[0].childNodes[0], 1)
        return { top: 0, left: 0 }
      } else {
        const span = this.createNewElement('span')
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
      let parent = this.currentChild as Element
      if (top === 0) {
        top = parent.getBoundingClientRect().top
          ? parent.getBoundingClientRect().top
          : this.currentDiv.getBoundingClientRect().top
      }

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
    let node = document.elementFromPoint(ev.clientX, ev.clientY)! as HTMLElement
    let nodes = document.elementsFromPoint(ev.clientX, ev.clientY)!

    if (this.selImage) {
      let span
      let div
      let mainDiv

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeName === 'SPAN') span = nodes[i]
        else if (nodes[i].isSameNode(this.selfRef.current)) mainDiv = nodes[i]
        else if (
          nodes[i].nodeName === 'DIV' &&
          !nodes[i].className &&
          !nodes[i].id
        )
          div = nodes[i]
        if (span && div && mainDiv) break
      }

      if (span) {
        const spanRect = span.getBoundingClientRect()
        const insertPos =
          ev.clientX > spanRect.right ? span.nextElementSibling : span
        span.parentElement!.insertBefore(this.selImage, insertPos)
      } else if (div) div.append(this.selImage)
      else if (
        mainDiv &&
        mainDiv.lastElementChild &&
        mainDiv.lastElementChild?.nodeName === 'DIV' &&
        ev.clientY > mainDiv.lastElementChild.getBoundingClientRect().bottom
      ) {
        const newSpan = this.createNewElement('span')
        newSpan.innerHTML = '\u200b'
        mainDiv.lastElementChild.append(this.selImage)
        mainDiv.lastElementChild.append(newSpan)
        this.select(newSpan.childNodes[0], 1)
      }

      this.selImage.setAttribute(
        'style',
        this.selImage.getAttribute('data-prevstyle')!
      )
      this.selImage.removeAttribute('data-mousedown')
      this.selImage.removeAttribute('data-prevstyle')
    }

    if (!this.selTable || !this.selTable.getAttribute('data-selectable')) return

    this.selTable.removeAttribute('data-mousedown')

    this.hideSelRectangle()
    this.RectanleSelector.className = ''
    if (
      this.selTable.getAttribute('data-movingcells') &&
      !isEmpty(this.selectedCells)
    ) {
      const sortedRows = Object.keys(this.selectedCells).sort()

      const cells: HTMLElement[][] = []

      const rowsCopy = []

      for (let i = 0; i < sortedRows.length; i++) {
        const row = this.selectedCells[sortedRows[i]] as HTMLElement[]
        if (!cells.includes(row)) {
          cells.push(row)
        }
      }

      const addEventListeners = (cell: HTMLElement, table: HTMLElement) => {
        this.addCellMouseDown(cell, table)
        this.addCellMouseMove(cell, table)
      }

      const setToTdAttr = (cell: HTMLElement, attr: string) => {
        cell.setAttribute(
          attr,
          this.selTable!.children[1].children[0].getAttribute(attr)!
        )
      }

      for (let i = 0; i < cells.length; i++) {
        const tr = this.createNewElement('tr')
        for (let j = 0; j < cells[i].length; j++) {
          const cell = cells[i][j]
          this.colorizeCell(cell, 'data-defaultcolor', false)
          const clonedCell = cell.cloneNode(true) as HTMLElement
          tr.append(clonedCell)
          if (clonedCell.nodeName === 'TH') {
            setToTdAttr(clonedCell, 'data-defaultcolor')
            setToTdAttr(clonedCell, 'data-selectcolor')
            setToTdAttr(clonedCell, 'data-dragcolor')
            setToTdAttr(clonedCell, 'style')
          }
        }
        tr.innerHTML = tr.innerHTML.replaceAll('<th', '<td')
        tr.innerHTML = tr.innerHTML.replaceAll('</th', '</td')
        rowsCopy.push(tr)
      }

      const tableRect = this.selTable.getBoundingClientRect()

      if (node.isSameNode(this.selfRef.current)) {
        alert('same')
        if (ev.clientY > tableRect.bottom) {
          if (
            ev.clientY >
            this.selfRef.current.lastElementChild.getBoundingClientRect().bottom
          )
            node = this.selfRef.current.lastElementChild as HTMLElement
          else node = this.selTable
        } else if (
          ev.clientY <= tableRect.bottom &&
          ev.clientY >= tableRect.top
        )
          node = this.selTable
        else {
          if (
            ev.clientY <
            this.selfRef.current.firstElementChild.getBoundingClientRect().top
          )
            node = this.selfRef.current.firstElementChild as HTMLElement
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

      document.body.style.cursor = 'auto'
      this.clearSelecedCells()
      this.selTable.removeAttribute('data-movingcells')
    }
  }

  hideSelRectangle() {
    this.RectanleSelector.hidden = true
    this.RectanleSelector.className = ''
  }

  clearSelecedCells() {
    this.selectedCells = {}
  }

  onMouseMove = (e: React.MouseEvent) => {
    const selectable =
      this.selTable && this.selTable.getAttribute('data-selectable')
    if (!selectable) return

    if (!this.selTable!.getAttribute('data-movingcells')) {
      if (!this.RectanleSelector.className) return
      this.RectanleSelector.hidden = false
      let table = this.selTable
      const selCRect = this.RectanleSelector.getBoundingClientRect()
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
    if (
      this.currentChild.parentNode &&
      this.currentChild.parentNode.parentNode &&
      (this.currentChild.parentNode.parentNode.nodeName === 'TD' ||
        this.currentChild.parentNode.parentNode.nodeName === 'TH')
    ) {
      const sel = window.getSelection()
      switch (e.key) {
        case 'Backspace':
          if (this.currentChild.innerHTML.length == 1) {
            this.currentChild.innerHTML = '\u200b'
            e.preventDefault()
          }
          break
        case 'ArrowLeft': {
          if (
            sel?.anchorOffset === 0 ||
            (sel?.anchorOffset === 1 &&
              this.currentChild.innerHTML === '\u200b')
          ) {
            const prevCell = this.currentChild.parentElement!.parentElement!
              .previousElementSibling?.lastElementChild!.lastElementChild!
              .childNodes[0] as CharacterData
            const prevUpCell = this.currentChild.parentElement!.parentElement!
              .parentElement!.previousElementSibling?.lastElementChild!
              .lastElementChild!.lastElementChild!
              .childNodes[0] as CharacterData
            if (prevCell) this.select(prevCell, prevCell.data.length)
            else if (prevUpCell) this.select(prevUpCell, prevUpCell.data.length)
            e.preventDefault()
          }
          break
        }
        case 'ArrowRight': {
          if (
            sel?.anchorOffset === this.currentChild.innerHTML.length ||
            (sel?.anchorOffset === 1 &&
              this.currentChild.innerHTML === '\u200b')
          ) {
            const nextCell = this.currentChild.parentElement!.parentElement!
              .nextElementSibling?.lastElementChild!.lastElementChild!
              .childNodes[0] as CharacterData
            const nextDownCell = this.currentChild.parentElement!.parentElement!
              .parentElement!.nextElementSibling?.firstElementChild!
              .lastElementChild!.lastElementChild!
              .childNodes[0] as CharacterData
            if (nextCell) this.select(nextCell, nextCell.data.length)
            else if (nextDownCell)
              this.select(nextDownCell, nextDownCell.data.length)
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
          if (prevUpCell.nodeName === 'SPAN')
            prevUpCell = prevUpCell.childNodes[0] as CharacterData
          else prevUpCell = prevUpCell.lastElementChild.childNodes[0]
          this.select(prevUpCell, prevUpCell.data.length)
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
          if (nextDownCell.nodeName === 'SPAN')
            nextDownCell = nextDownCell.childNodes[0] as CharacterData
          else nextDownCell = nextDownCell.lastElementChild.childNodes[0]
          this.select(nextDownCell, nextDownCell.data.length)
          e.preventDefault()
          break
        }
      }
    } else if (
      e.key === 'Backspace' &&
      this.currentChild.previousSibling?.nodeName === 'IMG' &&
      this.currentChild.innerHTML.length === 1
    ) {
      if (this.currentChild.innerHTML === '\u200b')
        this.currentChild.previousSibling.remove()
      else {
        this.currentChild.innerHTML = '\u200b'
        this.select(this.currentChild.childNodes[0], 1)
        e.preventDefault()
      }
    } else if (
      e.key === 'Backspace' &&
      this.currentChild.innerHTML === '\u200b'
    ) {
      this.currentChild.innerHTML = '\u200b'
    }
  }

  onSelect = () => {
    this.update()
  }

  makeSelectRect = () => {
    let x1 = Math.min(this.selRectangleCoords.x1, this.selRectangleCoords.x2)
    let x2 = Math.max(this.selRectangleCoords.x1, this.selRectangleCoords.x2)
    let y1 = Math.min(this.selRectangleCoords.y1, this.selRectangleCoords.y2)
    let y2 = Math.max(this.selRectangleCoords.y1, this.selRectangleCoords.y2)
    this.RectanleSelector.style.left = x1 + 'px'
    this.RectanleSelector.style.top = y1 + 'px'
    this.RectanleSelector.style.width = x2 - x1 + 'px'
    this.RectanleSelector.style.height = y2 - y1 + 'px'
  }

  insertTable = (
    rows: number,
    cols: number,
    cssString: string = '',
    selectable: boolean = true
  ) => {
    const cssArr = parseCSS(cssString)
    const insertRuleIfNotFound = (
      index: number,
      key: string,
      value: string,
      selector: any = false
    ) => {
      if (!cssArr[index].rules.includes(key)) {
        cssString =
          cssString +
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

    const tableStrIndex = cssString.indexOf('table')
    const lastPara = cssString.indexOf('}', tableStrIndex)
    if (tableStrIndex !== -1) {
      cssString =
        cssString.slice(0, tableStrIndex) +
        cssString.slice(tableStrIndex + 6, lastPara) +
        cssString.slice(lastPara + 1)
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

    const currDiv = this.currentDiv as HTMLElement
    const colWidth = currDiv.getBoundingClientRect().width / (cols + 1)

    insertRuleIfNotFound(tdIndex, 'width', `${colWidth}px`, 'td')
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
      ${cssString}
    `

    let table = createElementFromHTML(
      ReactDOMServer.renderToStaticMarkup(<Table />)
    )

    if (selectable) table.setAttribute('data-selectable', 'true')

    if (!this.nextMainCurrentDiv) {
      const div = this.createNewElement('div')
      const span = this.createNewElement('span')
      span.innerHTML = '\u200b'
      div.appendChild(span)
      this.selfRef.current.appendChild(div)
      this.nextMainCurrentDiv = div
    }
    this.selfRef.current.insertBefore(table, this.nextMainCurrentDiv)

    for (let i = 0; i < rows; i++) {
      const tr = this.createNewElement('tr')
      table.appendChild(tr)

      for (let j = 0; j < cols; j++) {
        const cell =
          i === 0 ? this.createNewElement('th') : this.createNewElement('td')

        this.addCellMouseDown(cell, table)
        this.addCellMouseMove(cell, table)

        const div = this.createNewElement('div')
        const span = this.createNewElement('span')

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

    this.currentDiv = table.firstElementChild!.firstElementChild!
      .firstElementChild! as HTMLElement
    this.currentChild = table.firstElementChild!.firstElementChild!
      .firstElementChild!.firstElementChild! as HTMLElement

    this.select(this.currentChild, 1)
    this.commitChanges()
  }

  insertImage = (src: string, autoResize = true) => {
    const img = this.createNewElement('img') as HTMLImageElement

    img.src = src

    img.addEventListener('mousedown', (ev: MouseEvent) => {
      this.selImage = img
      img.setAttribute('data-mousedown', 'true')
      img.setAttribute('data-prevstyle', img.getAttribute('style')!)
      this.currentDiv = img.parentElement as HTMLElement
      this.currentChild = img.nextElementSibling as HTMLElement
      this.props.setIsCaretHidden(true)
      // img.style.float = 'left'
      this.update()
      ev.preventDefault()
    })

    img.addEventListener('mousemove', (ev: MouseEvent) => {
      if (img.hasAttribute('data-mousedown')) {
        img.style.position = 'absolute'
        img.style.transform = `translate(-50%, -50%)`
        img.style.top = `${ev.pageY}px`
        img.style.left = ` ${ev.pageX}px`
        img.style.cursor = 'grabbing'
        img.style.opacity = '0.4'
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

    const spanAfter = this.createNewElement('span')

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
        this.RectanleSelector.className = 'sel'
        this.selTable = table
        this.selRectangleCoords.x1 = e.pageX
        this.selRectangleCoords.y1 = e.pageY

        this.resetCellsStyles()

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

  resetCellsStyles = (clearArr = true) => {
    const rowsKeys = Object.keys(this.selectedCells)

    for (let i = 0; i < rowsKeys.length; i++) {
      const row = this.selectedCells[rowsKeys[i]] as HTMLElement[]
      for (let j = 0; j < row.length; j++) {
        const cell = row[j]
        cell.style.backgroundColor = cell.getAttribute('data-defaultcolor')!
      }
    }
    if (clearArr) this.selectedCells = []
  }

  onMouseDown = (e: React.MouseEvent) => {
    const elems = document.elementsFromPoint(e.clientX, e.clientY)

    const img = elems.find((elem) => elem.nodeName === 'IMG')
    const table = elems.find((elem) => elem.nodeName === 'TABLE')

    if (this.selTable && !table) {
      this.props.setIsCaretHidden(false)
      this.selTable = null
      this.resetCellsStyles()
    }
    if (this.selImage && !img) {
      this.selImage = null
      this.props.setIsCaretHidden(false)
    }
  }

  render() {
    const ContentEditable = styled.div`
      width: 300px;
      height: 400px;
      border: 1px solid black;
      word-wrap: break-word;
      white-space: pre-wrap;
      overflow: auto;
    `
    return (
      <ContentEditable
        onInput={() => this.onInput()}
        onFocus={() => this.onInput()}
        onBlur={() => this.onInput(true)}
        onMouseMove={this.onMouseMove}
        onMouseLeave={() => {}} // drop image
        onMouseUp={this.onMouseUp}
        onMouseDown={this.onMouseDown}
        onKeyDown={this.onKeyDown}
        onKeyUp={() => {}}
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
