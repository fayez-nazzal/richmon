import React, { useEffect, useState } from 'react'
import { Richmon, Actions } from 'react-richmon'
import CustomRichButton from './CustomRichButton'

const colors = [
  'hsla(163.02, 97.37%, 45.3%, 1)',
  'hsla(19.89, 96.54%, 41.2%, 1)',
  'hsla(191.54, 92.86%, 45.22%, 1)',
  'hsla(237.56, 97.35%, 40.73%, 1)'
]

const gradientBackground = `
  background:
  -webkit-linear-gradient(315deg, hsla(163.02, 97.37%, 45.3%, 1) 0%, hsla(163.02, 97.37%, 45.3%, 0) 70%),
  -webkit-linear-gradient(65deg, hsla(19.89, 96.54%, 41.2%, 1) 10%, hsla(19.89, 96.54%, 41.2%, 0) 80%),
  -webkit-linear-gradient(135deg, hsla(191.54, 92.86%, 45.22%, 1) 15%, hsla(191.54, 92.86%, 45.22%, 0) 80%),
  -webkit-linear-gradient(205deg, hsla(237.56, 97.35%, 40.73%, 1) 100%, hsla(237.56, 97.35%, 40.73%, 0) 70%);
  background:
  linear-gradient(135deg, hsla(163.02, 97.37%, 45.3%, 1) 0%, hsla(163.02, 97.37%, 45.3%, 0) 70%),
  linear-gradient(25deg, hsla(19.89, 96.54%, 41.2%, 1) 10%, hsla(19.89, 96.54%, 41.2%, 0) 80%),
  linear-gradient(315deg, hsla(191.54, 92.86%, 45.22%, 1) 15%, hsla(191.54, 92.86%, 45.22%, 0) 80%),
  linear-gradient(245deg, hsla(237.56, 97.35%, 40.73%, 1) 100%, hsla(237.56, 97.35%, 40.73%, 0) 70%);
`

const App = () => {
  const [content, setContent] = useState('<div></div>')
  const [caretColor, setCaretColor] = useState('black')

  useEffect(() => {
    const caretColorInterval = setInterval(() => {
      const color = pickRandomColor()
      Actions.setCss(`color: ${color};`)
      setCaretColor(color)
    }, 800)
    return () => {
      clearInterval(caretColorInterval)
    }
  }, [])

  const pickRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <Richmon
      content={content}
      onChange={setContent}
      tools={['B', 'I', 'U', 'S', 'sub', 'sup', 'textHighlight', 'ddada']}
      toolbarCss={`${gradientBackground}`}
      editorCss='background-color: #58B4D013;'
      css='box-shadow: none !important;-webkit-box-shadow: none !important;'
      width='100wh'
      height='100vh'
      caretColor={caretColor}
      defaultButtonCss={`
        &:hover {
          background-color: ${colors[2]};
          outline: 2px groove ${colors[0]};
        }
      `}
      defaultActionButtonCss={`
        &:hover {
          background-color: ${colors[2]};
          outline: 2px groove ${colors[0]};
        }
      `}
      defaultButtonWrapperCss={`
        &:hover {
          outline: 2px groove ${colors[0]};
        }
      `}
      defaultButtonHeight='25px'
      defaultColorRichMenuCss={`${gradientBackground}; padding: 10px;`}
      disableSmootCaret
    />
  )
}

export default App
