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
    const boundingRect = window
      .getSelection()!
      .getRangeAt(0)
      .getBoundingClientRect()
    try {
      const childRect = (this.currentChild as Element).getBoundingClientRect()

      console.log('!!')
      let top = boundingRect.top
      if (top === 0) {
        let parent = this.currentChild as Element
        let c = 0
        while (parent.parentElement !== null) {
          parent = parent.parentElement
          top += parent.getBoundingClientRect().top
          console.log(top === 0)
          c++
        }
        if (c == 0) console.log(',,', parent)
      }
      const obj = {
        top: top,
        left: boundingRect.left === 0 ? childRect.left : boundingRect.left
      }
      console.log(obj)
      return obj
    } catch {
      alert('!!')
      return { top: 414, left: 211 }
    }
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
    const node = this.currentChild as HTMLDivElement
    if (node === null) {
      alert('node is null')
      return
    }
    let prevNode = node.previousSibling as HTMLDivElement
    if (node.innerHTML === '\u200b') {
      if (prevNode && prevNode.nodeName === 'SPAN') {
        node.parentNode?.removeChild(node)
        this.currentChild = prevNode
      } else if (prevNode) {
        alert('UNHANDELED CASE, prev node is not span!')
      } else {
        if (node.isEqualNode(this.selfRef.current.children[0]))
          e.preventDefault()
        else {
        }
      }
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
    console.log(
      window.getSelection()?.anchorNode?.nodeName === '#text'
        ? window.getSelection()?.anchorNode?.parentNode
        : window.getSelection()?.anchorNode
    )
    this.updateCaretPos()
  }

  onKeyUp = (e: React.KeyboardEvent) => {
    // const sel = window.getSelection()
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
