import React from 'react'
import './style.css'
import assert from 'assert'
import { attribute, EditorProps } from './types'

class Editor extends React.Component<EditorProps> {
  public selfRef: any = React.createRef()
  public currentDiv: Element
  public currentChild: Node
  private textColor: string = this.props.defaultTextColor
  private hgColor: string = this.props.defaultHgColor
  private fontSize: string = this.props.defaultFontSize
  constructor(props: EditorProps) {
    super(props)
  }

  componentDidMount() {
    const selfElem = this.selfRef.current as Element
    this.currentDiv = selfElem.children[0]
    this.currentChild = this.appendTextSpan()
    this.commitChanges()
    // this.lastTextColor = this.props.textColor
    // this.lastHgColor = this.props.hgColor
  }

  shouldComponentUpdate() {
    return false
  }

  setCurrentDiv() {
    const sel = window.getSelection()
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

    assert(this.currentDiv)
  }

  commitChanges = () => {
    const selfElem = this.selfRef.current as Element
    const html = selfElem.innerHTML
    this.props.setEditorHTML(html)
  }

  highlightText = (color: string) => {
    this.hgColor = color
    this.currentChild = this.appendTextSpan()
    this.select(this.currentChild as Element, 1)
  }

  appendElement = (type: string, ...attrs: attribute[]) => {
    const elem = document.createElement(type)
    for (let i = 0; i < attrs.length; i++) {
      elem.setAttribute(attrs[i].name, attrs[i].value)
    }
    this.currentDiv.append(elem)
    return elem
  }

  appendTextSpan = () => {
    const elem = this.appendElement(
      'span',
      {
        name: 'style',
        value: `color:${this.textColor};background-color:${this.hgColor};font-size:${this.fontSize};`
      },
      {
        name: 'class',
        value: 'text'
      }
    )
    elem.innerHTML = '\u200b'
    return elem
  }

  onInput = (blur = false) => {
    // const sel = window.getSelection() as Selection
    // const node = sel.anchorNode as Node
    // const parentNode = node.parentNode as Element
    // if (node.nodeName === '#text' && parentNode.className === 'text') {
    //   const style = parentNode.getAttribute('style') as string
    //   const colorAttrIndex = style.indexOf('color:')
    //   const colorStart = style.indexOf(':', colorAttrIndex)
    //   const colorEnd = style.indexOf(';', colorStart)
    //   const hgColorAttrIndex = style.indexOf('background-color:')
    //   const hgColorStart = style.indexOf(':', hgColorAttrIndex)
    //   const hgColorEnd = style.indexOf(';', hgColorStart)
    //   const textColor = style.substring(colorStart + 1, colorEnd)
    //   const hgColor = style.substring(hgColorStart + 1, hgColorEnd)
    //   this.props.setTextColor(textColor)
    //   this.props.setHgColor(hgColor)
    //   this.lastTextColor = textColor
    //   this.lastHgColor = hgColor
    // }

    this.commitChanges()
    this.props.setIsCaretHidden(blur)
  }

  getCaretPos = () => {
    let top
    let left

    const boundingRect = window
      .getSelection()!
      .getRangeAt(0)
      .getBoundingClientRect()

    console.log(this.currentChild)
    top = boundingRect.y + window.scrollY
    left = boundingRect.x + window.scrollX
    try {
      const childRect = (this.currentChild as Element).getBoundingClientRect()

      console.log(boundingRect.x, boundingRect.y)
      console.log(
        'x should be',
        boundingRect.left === 0
          ? boundingRect.left + childRect.left
          : boundingRect.left
      )
      console.log(
        'y should be',
        boundingRect.top === 0
          ? boundingRect.top + childRect.top
          : boundingRect.top
      )
      return {
        top:
          boundingRect.top === 0
            ? boundingRect.top + childRect.top
            : boundingRect.top,
        left:
          boundingRect.left === 0
            ? boundingRect.left + childRect.left
            : boundingRect.left
      }
    } catch {
      return { top: 414, left: 211 }
    }

    console.log('top ' + top, 'left' + left)

    return { top: 432, left: 42 }
  }

  updateCaretPos = () => {
    this.setCurrentDiv()
    this.props.setCaretPos(this.getCaretPos())
  }

  select = (elem: Element, at: number) => {
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

  handleBackspace(e: React.KeyboardEvent) {
    const sel = window.getSelection()
    if (sel === null) {
      alert('sel is null')
      return
    }
    const node = sel.anchorNode
    if (node === null) {
      alert('node is null')
      return
    }
    switch (node.nodeName) {
      case '#text':
        let prevNode = node.parentNode!.previousSibling
        console.log('prev node', prevNode)
        if (
          (node as CharacterData).data === '\u200b' &&
          this.currentDiv.isEqualNode(
            (this.selfRef.current as Element).children[0]
          ) &&
          !prevNode
        ) {
          e.preventDefault()
        } else if ((node as CharacterData).data === '\u200b') {
          if (node.parentNode!.isEqualNode(this.currentDiv.children[0])) {
            console.log('removing', node.parentNode)
            this.currentDiv.removeChild(node.parentNode!)
            if (this.currentDiv.previousSibling) {
              const prevDivLastChild = this.currentDiv.previousSibling.lastChild
              if (prevDivLastChild && prevDivLastChild.nodeName === 'SPAN')
                (prevDivLastChild as Element).innerHTML += '\u200b'
            }
          } else if (prevNode) {
            ;(prevNode as HTMLElement).innerText = (prevNode as HTMLElement).innerText.slice(
              0,
              -1
            )
            console.log('prevnode innertext sliced')
          }
        }
        console.log('parent', node.parentNode)
    }
  }

  onKeyDown = (event: React.KeyboardEvent) => {
    this.updateCaretPos()
    // const sel = window.getSelection()
    this.setCurrentDiv()
    if (event.key === 'Backspace') this.handleBackspace(event)
    const firstChild = this.currentDiv.children[0]
    if (
      this.currentChild.previousSibling &&
      firstChild.isEqualNode(this.currentChild.previousSibling) &&
      firstChild.innerHTML === '\u200b'
    ) {
      alert('removing empty cild')
      this.currentDiv.removeChild(this.currentChild.previousSibling)
    }
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
    console.log(this.currentDiv)
    if (e.key === 'Enter') {
      if (
        this.currentDiv.previousSibling &&
        this.currentDiv.previousSibling.lastChild
      ) {
        const lastChild = this.currentDiv.previousSibling.lastChild
        const childCount = (this.currentDiv.previousSibling as Element).children
          .length
        if (childCount > 1 && (lastChild as Element).innerHTML === '\u200b') {
          this.currentDiv.previousSibling.removeChild(this.currentChild)
        } else if ((lastChild as Element).innerHTML === '<br>') {
          ;(lastChild as Element).innerHTML = '\u200b'
        }
        this.commitChanges()
      }
      if (this.currentDiv && this.currentDiv.lastChild) {
        const lastChild = this.currentDiv.lastChild
        if ((lastChild as Element).innerHTML === '<br>') {
          ;(lastChild as Element).innerHTML = '\u200b'
        }
      }
      this.currentChild = this.currentDiv.childNodes[0]
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
