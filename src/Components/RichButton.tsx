import React from 'react'

export default (_props: {
  actions: (string | { (): any })[]
  children?: any
  css?: string
}) => {
  return <div>{_props.children}</div>
}
