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
  public currentDiv: Element
  public nextMainCurrentDiv: HTMLElement | null
  public currentChild: HTMLElement
  private defaultCss = `color:${this.props.defaultTextColor};font-size:${this.props.defaultFontSize};`
  private cssSet: any = []
  private selTable: HTMLElement
  private isMovingRows = false
  private selectedCells: any = {}
  private selectedCellsStyles: any = {}
  private cellsStyles: string[][] = []
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
    this.selRectangle.style.border = '1px dashed #6C747680'
    this.selRectangle.style.backgroundColor = '#68b0ab50'
    this.selRectangle.style.pointerEvents = 'none'
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
    console.log(node)

    if (
      node.isSameNode(this.selRectangle) ||
      node.isSameNode(this.selfRef.current)
    ) {
      this.select(
        this.currentChild.childNodes[0]
          ? this.currentChild.childNodes[0]
          : this.currentChild,
        this.currentChild.childNodes[0]
          ? (this.currentChild.childNodes[0] as CharacterData).data.length
          : 1
      )
      return
    }

    const nodeName = node.nodeName
    const parentNode = node.parentNode!
    const parentName = parentNode.nodeName
    if (nodeName === 'SPAN') {
      this.currentDiv = parentNode as HTMLElement
      this.currentChild = node as HTMLElement
    } else if (nodeName === '#text') {
      this.currentDiv = parentNode.parentNode as HTMLElement
      this.currentChild = parentNode as HTMLElement
      console.log(this.currentDiv)

      console.log(this.currentDiv)
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

    this.nextMainCurrentDiv = this.selTable
      ? (this.selTable.nextElementSibling as HTMLElement)
      : (this.currentDiv.nextElementSibling as HTMLElement)

    console.debug(this.currentDiv)
    console.debug(this.currentChild)

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
      console.error(this.currentDiv.innerHTML)
      let top = boundingRect.top
      let left = boundingRect.left
      let parent = this.currentChild as Element
      if (top === 0)
        top = parent.getBoundingClientRect().top
          ? parent.getBoundingClientRect().top
          : this.currentDiv.getBoundingClientRect().top

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
    this.hideSelRectangle()
    this.selRectangle.className = ''
    if (this.isMovingRows && !isEmpty(this.selectedCells)) {
      const sortedRows = Object.keys(this.selectedCells).sort()

      const cells: HTMLElement[][] = []
      const sellectedCellsStyles: string[][] = []

      const rowsCopy = []

      for (let i = 0; i < sortedRows.length; i++) {
        const row = this.selectedCells[sortedRows[i]] as HTMLElement[]
        const stylesRow = this.selectedCellsStyles[sortedRows[i]] as string[]
        if (!cells.includes(row)) {
          cells.push(row)
          sellectedCellsStyles.push(stylesRow)
        }
      }

      console.error(sellectedCellsStyles)
      for (let i = 0; i < cells.length; i++) {
        const tr = this.createNewElement('tr')
        for (let j = 0; j < cells[i].length; j++) {
          const cell = cells[i][j]
          cell.setAttribute('style', sellectedCellsStyles[i][j])
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

          let colNumber = rowsCopy[i].childElementCount
          let totalSpan = 0

          for (let j = 0; j < colNumber; j++) {
            let colSpan = Math.ceil(tableSpan / colNumber)
            totalSpan += colSpan
            const cell = rowsCopy[i].children[j] as HTMLTableDataCellElement

            for (let k = 0; totalSpan >= tableSpan && j < colNumber - 1; k++) {
              const cell = rowsCopy[i].children[k] as HTMLTableDataCellElement
              cell.colSpan--
              totalSpan--
            }

            cell.colSpan = colSpan
            this.addCellMouseDown(cell, this.selTable)
          }
        }

        this.cellsStyles = []
        for (let i = 0; i < this.selTable.children.length; i++) {
          this.cellsStyles.push([])
          for (let j = 0; j < this.selTable.children[i].children.length; j++) {
            const cell = this.selTable.children[i].children[j]
            this.cellsStyles[i][j] = cell.getAttribute('style')!
          }
        }
      } else if (
        node?.nodeName === 'DIV' &&
        node.parentElement === this.selfRef.current
      ) {
        const newTable = this.createNewElement('table')
        for (let i = 0; i < rowsCopy.length; i++) newTable.append(rowsCopy[i])
        this.selfRef.current.insertBefore(newTable, node.nextElementSibling)
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
      this.clearSelecedCells()
      this.isMovingRows = false
    }
  }

  hideSelRectangle() {
    this.selRectangle.hidden = true
    this.selRectangle.className = ''
  }

  clearSelecedCells() {
    this.selectedCells = {}
    this.selectedCellsStyles = {}
  }

  onMouseMove = (e: React.MouseEvent) => {
    if (!this.isMovingRows) {
      if (!this.selRectangle.className) return
      this.selRectangle.hidden = false
      let table = this.selTable
      const selCRect = this.selRectangle.getBoundingClientRect()
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

            addToSelectedCells(this.selectedCellsStyles, this.cellsStyles[i][j])
            if (!this.cellsStyles[i][j]) console.log('!!!')
            cell.style.backgroundColor = '#68b0ab50'
            cell.className = 'selected'
          } else {
            cell.setAttribute('style', this.cellsStyles[i][j])
            cell.className = ''
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
          row[j].style.backgroundColor = 'yellow'
      }
    }
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
      this.currentChild.innerHTML === '\u200b'
    )
      this.currentChild.innerHTML = '\u200b'
  }
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
  // cell.style.border = '1px solid black'
  // cell.style.width = '10px'
  // cell.style.height = '20px'
  // cell.style.margin = '0'
  // cell.style.textAlign = 'center'
  // cell.style.fontWeight = 'normal'

  insertTable = (rows: number, cols: number, cssString: string = '') => {
    const cssArr = parseCSS(cssString)
    console.log(cssArr)
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
      console.log(cssString)
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

    tdDefaultStyle = cssObjToString(tdDefaultStyle)
    thDefaultStyle = cssObjToString(thDefaultStyle)
    // if (!cssString.includes('td')) {
    //   cssString =
    //     cssString +
    //     `
    //   td {
    //     border: 1px solid black;
    //     text-align: center;
    //     font-weight: normal;
    //     margin: 0;
    //   }`
    // }
    // if (!cssString.includes('th')) {
    //   cssString =
    //     cssString +
    //     `
    //   th {
    //     background-color: blue;
    //     border: 1px solid black;
    //     text-align: center;
    //     font-weight: normal;
    //     margin: 0;
    //   }`
    // }
    // if (!cssString.includes('width')) {
    //   cssString =
    //     cssString +
    //     `td, th {
    //     width: ${celLWidth}px;
    //   }`
    // }
    const Table = styled.table`
      ${cssString}
    `

    let table = createElementFromHTML(
      ReactDOMServer.renderToStaticMarkup(<Table />)
    )
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
      table.style.borderCollapse = 'collapse'
      this.cellsStyles.push([])
      for (let j = 0; j < cols; j++) {
        const cell =
          i === 0 ? this.createNewElement('th') : this.createNewElement('td')
        this.addCellMouseDown(cell, table)

        cell.addEventListener('mousemove', () => {
          if (!isEmpty(this.selectedCells)) {
            this.select(
              cell.lastElementChild!.lastElementChild!.childNodes[0],
              1
            )
            this.props.setIsCaretHidden(true)
          }
        })

        const div = this.createNewElement('div')
        const span = this.createNewElement('span')

        this.cellsStyles[i][j] =
          cell.nodeName === 'TH' ? thDefaultStyle : tdDefaultStyle
        console.error(tdDefaultStyle)
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
    console.log(cssString)
  }

  addCellMouseDown(cell: HTMLElement, table: HTMLElement) {
    cell.addEventListener('mousedown', (e: MouseEvent) => {
      this.props.setIsCaretHidden(false)
      if (!isEmpty(this.selectedCells) && cell.className === 'selected') {
        this.isMovingRows = true
        document.body.style.cursor = 'copy'
        e.preventDefault()
      } else {
        document.body.style.cursor = 'text'
        this.selRectangle.className = 'sel'
        this.selTable = table
        this.selRectangleCoords.x1 = e.pageX
        this.selRectangleCoords.y1 = e.pageY

        const rowsKeys = Object.keys(this.selectedCells)

        for (let i = 0; i < rowsKeys.length; i++) {
          const row = this.selectedCells[rowsKeys[i]] as HTMLElement[]
          for (let j = 0; j < row.length; j++) {
            const cell = row[j]
            cell.setAttribute('style', this.selectedCellsStyles[rowsKeys[i]][j])
          }
        }
        this.isMovingRows = false
        this.makeSelectRect()
      }
    })
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
