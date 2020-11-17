export function stringToCssObj(cssString: string) {
  const regex = /([\w-]*)\s*:\s*([^;]*)/g
  let match
  let cssObj: any = {}
  while ((match = regex.exec(cssString))) cssObj[match[1]] = match[2].trim()
  return cssObj
}

export function cssObjToString(cssObj: any) {
  return Object.entries(cssObj)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
}

export function isBefore(node1: Node, node2: Node) {
  return (
    (node1.compareDocumentPosition(node2) & Node.DOCUMENT_POSITION_FOLLOWING) >
    0
  )
}

export function isMatchingKeysEqual(obj1: any, obj2: any) {
  return Object.entries(obj1).some(([key, val]) => obj2[key] === val)
}

export function createElementFromHTML(htmlString: string) {
  let div = document.createElement('div') as HTMLElement
  div.innerHTML = htmlString.trim()
  return div.firstChild as HTMLElement
}

export function createNewElement(type: string) {
  const elem = document.createElement(type)
  return elem
}

export const isRTL = (str: string) => {
  var ltrChars =
      'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
      '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
    rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
    rtlDirCheck = new RegExp('^[^' + ltrChars + ']*[' + rtlChars + ']')

  return rtlDirCheck.test(str)
}
