import React, { useState } from 'react'
import RichButton from '../Components/RichButton'
import List from './List'
import Page from './Page'
import Flex from './Flex'
import Grid from './Grid'
import ColorPickTools from './ColorPickInputs'

export default (_props: any) => {
  const [customColors, setCustomColors] = useState<(string | JSX.Element)[]>([])

  const addCustomColor = (colorAction: string) => {
    const customColorsClone = [...customColors]
    if (customColors.length > 6) customColorsClone.splice(0, 1)
    customColorsClone.push(colorAction)
    setCustomColors(customColorsClone)
  }

  return (
    <React.Fragment>
      <List
        key='color-list'
        css={`
          padding: 10px 50% 10px 50%;
        `}
        buttonChildren='hello'
        parent={_props.parent}
        width='150px'
      >
        <Page key='page1'>
          <div
            style={{
              textAlign: 'center',
              fontSize: '13px',
              marginBottom: '-6px'
            }}
          >
            Featured colors
          </div>
          <hr />
          <Grid
            key='grid3'
            rows={2}
            cols={6}
            items={[
              'textColor(#00bcd4)',
              'textColor(#b2ebf2)',
              'textColor(#dddddd)',
              'textColor(#d9adad)',
              'textColor(#faf3dd)',
              'textColor(#d789d7)',
              'textColor(#bbd196)',
              'textColor(#fcf876)',
              'textColor(#ee6f57)',
              'textColor(#f0daa4)',
              'textColor(#eaac9d)',
              'textColor(#a09d9c)'
            ]}
            parent={parent}
          />
          <div
            style={{
              textAlign: 'center',
              fontSize: '13px',
              marginTop: '6px',
              marginBottom: '-6px'
            }}
          >
            Basic colors
          </div>
          <hr />
          <Grid
            key='grid1'
            rows={5}
            cols={6}
            items={[
              'textColor(black)',
              'textColor(#5a5a5a)',
              'textColor(#737373)',
              'textColor(#8d8d8d)',
              'textColor(#a6a6a6)',
              'textColor(#b22222)',
              'textColor(#ff0000)',
              'textColor(#ff3b3b)',
              'textColor(#ff6262)',
              'textColor(#ff8989)',
              'textColor(#00b300)',
              'textColor(#00ff00)',
              'textColor(#80ff80)',
              'textColor(#9dff9d)',
              'textColor(#c4ffc4)',
              'textColor(#0000b3)',
              'textColor(#0000ff)',
              'textColor(#4d4dff)',
              'textColor(#0080ff)',
              'textColor(#00ffff)',
              'textColor(#cccc00)',
              'textColor(#ffff00)',
              'textColor(#ffff4e)',
              'textColor(#ffff89)',
              'textColor(#ffffb1)',
              'textColor(#008080)',
              'textColor(#9370db)',
              'textColor(#8B4513)',
              'textColor(#ffa500)',
              'textColor(#daa520)'
            ]}
            parent={parent}
          />
          <div
            style={{
              textAlign: 'center',
              fontSize: '13px',
              marginTop: '6px',
              marginBottom: '-6px'
            }}
          >
            Custom colors
          </div>
          <hr />
          <Grid
            key='grid2'
            rows={1}
            cols={6}
            items={customColors}
            parent={parent}
          />
          <Flex
            items={[
              <RichButton actions={['nextPage']} css='margin-top: 8px;'>
                Custom
              </RichButton>
            ]}
            parent={parent}
          />
        </Page>
        <Page key='page2'>
          <ColorPickTools addCustomColor={addCustomColor} />
        </Page>
      </List>
    </React.Fragment>
  )
}
