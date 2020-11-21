import React, { useEffect, useState } from 'react'
import { Richmon, Actions } from 'react-richmon'
import CustomRichButton from './CustomRichButton'

const colors = [
  'hsla(163.02, 97.37%, 45.3%, 1)',
  'hsla(19.89, 96.54%, 41.2%, 1)',
  'hsla(191.54, 92.86%, 45.22%, 1)',
  'hsla(237.56, 97.35%, 40.73%, 1)'
]

const colorfulBackground = `
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
      tools={[
        <CustomRichButton
          action={(actions) => {
            actions.setBold()
          }}
          textColor='#58B4D0'
        >
          B
        </CustomRichButton>,
        <CustomRichButton
          action={(actions) => {
            actions.setItalic()
          }}
          textColor='#58B4D0;'
        >
          I
        </CustomRichButton>,
        <CustomRichButton
          action={(actions) => {
            actions.setUnderline()
          }}
          textColor='#58B4D0;'
          css='text-decoration: underline;'
        >
          U
        </CustomRichButton>,
        <CustomRichButton
          action={(actions) => {
            actions.setStrikeThrough()
          }}
          textColor='#58B4D0'
          css='text-decoration: line-through;'
        >
          T
        </CustomRichButton>,
        <CustomRichButton
          action={(actions) => {
            actions.setSub()
          }}
          textColor='#58B4D0;'
        >
          A<sub style={{ color: '#E64688' }}>x</sub>
        </CustomRichButton>,
        <CustomRichButton
          action={(actions) => {
            actions.setSub()
          }}
          textColor='#58B4D0;'
        >
          B<sup style={{ color: '#E64688' }}>x</sup>
        </CustomRichButton>,
        'fontSize',
        'textHighlight'
      ]}
      toolbarCss={`${colorfulBackground}`}
      editorCss='background-color: #58B4D013;'
      css='box-shadow: none !important;-webkit-box-shadow: none !important;'
      width='100wh'
      height='100vh'
      caretColor={caretColor}
      defaultColorRichMenuCss={`${colorfulBackground}; padding: 10px;`}
      disableSmootCaret
    />
  )
}

export default App
