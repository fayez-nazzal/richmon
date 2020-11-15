import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { parseCSS } from 'css-parser'
import { createElementFromHTML, createNewElement } from './richmonUtils'
import styled from 'styled-components'

export function createTable(
  rows: number,
  cols: number,
  cssString: string,
  tableWidth: number,
  cellHeight: string,
  nextDiv: HTMLElement,
  selectable: boolean
) {
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
    ${cssString}
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
          i === 0 ? thDefaultStyle['drag-color'] : tdDefaultStyle['drag-color']
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

  return table
}
