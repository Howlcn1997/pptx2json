import { getHorizontalAlign } from './align'
import { getTextByPathList } from './utils'

import {
  getFontType,
  getFontColor,
  getFontSize,
  getFontBold,
  getFontItalic,
  getFontDecoration,
  getFontDecorationLine,
  getFontSpace,
  getFontSubscript,
  getFontShadow,
} from './fontStyle'

export function genTextBody(textBodyNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj, fontsizeFactor, slideFactor) {
  if (!textBodyNode) return ''

  let text = ''
  const slideMasterTextStyles = warpObj['slideMasterTextStyles']

  const pNode = textBodyNode['a:p']
  const pNodes = pNode.constructor === Array ? pNode : [pNode]

  let isList = ''

  for (const pNode of pNodes) {
    let rNode = pNode['a:r']
    let fldNode = pNode['a:fld']
    let brNode = pNode['a:br']
    if (rNode) {
      rNode = (rNode.constructor === Array) ? rNode : [rNode]

      if (fldNode) {
        fldNode = (fldNode.constructor === Array) ? fldNode : [fldNode]
        rNode = rNode.concat(fldNode)
      }
      if (brNode) {
        brNode = (brNode.constructor === Array) ? brNode : [brNode]
        brNode.forEach(item => item.type = 'br')
  
        if (brNode.length > 1) brNode.shift()
        rNode = rNode.concat(brNode)
        rNode.sort((a, b) => {
          if (!a.attrs || !b.attrs) return true
          return a.attrs.order - b.attrs.order
        })
      }
    }

    const align = getHorizontalAlign(pNode, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles)

    const listType = getListType(pNode)
    if (listType) {
      if (!isList) {
        text += `<${listType}>`
        isList = listType
      }
      else if (isList && isList !== listType) {
        text += `</${isList}>`
        text += `<${listType}>`
        isList = listType
      }
      text += `<li style="text-align: ${align};">`
    }
    else {
      if (isList) {
        text += `</${isList}>`
        isList = ''
      }
      text += `<p style="text-align: ${align};">`
    }
    
    if (!rNode) text += genSpanElement(pNode, slideLayoutSpNode, type, warpObj, fontsizeFactor, slideFactor)
    else {
      for (const rNodeItem of rNode) {
        text += genSpanElement(rNodeItem, slideLayoutSpNode, type, warpObj, fontsizeFactor, slideFactor)
      }
    }

    if (listType) text += '</li>'
    else text += '</p>'
  }
  return text
}

export function getListType(node) {
  const pPrNode = node['a:pPr']
  if (!pPrNode) return ''

  if (pPrNode['a:buChar']) return 'ul'
  if (pPrNode['a:buAutoNum']) return 'ol'
  
  return ''
}

export function genSpanElement(node, slideLayoutSpNode, type, warpObj, fontsizeFactor, slideFactor) {
  const slideMasterTextStyles = warpObj['slideMasterTextStyles']

  let text = node['a:t']
  if (typeof text !== 'string') text = getTextByPathList(node, ['a:fld', 'a:t'])
  if (typeof text !== 'string') text = '&nbsp;'

  let styleText = ''
  const fontColor = getFontColor(node)
  const fontSize = getFontSize(node, slideLayoutSpNode, type, slideMasterTextStyles, fontsizeFactor)
  const fontType = getFontType(node, type, warpObj)
  const fontBold = getFontBold(node)
  const fontItalic = getFontItalic(node)
  const fontDecoration = getFontDecoration(node)
  const fontDecorationLine = getFontDecorationLine(node)
  const fontSpace = getFontSpace(node, fontsizeFactor)
  const shadow = getFontShadow(node, warpObj, slideFactor)
  const subscript = getFontSubscript(node)

  if (fontColor) styleText += `color: ${fontColor};`
  if (fontSize) styleText += `font-size: ${fontSize};`
  if (fontType) styleText += `font-family: ${fontType};`
  if (fontBold) styleText += `font-weight: ${fontBold};`
  if (fontItalic) styleText += `font-style: ${fontItalic};`
  if (fontDecoration) styleText += `text-decoration: ${fontDecoration};`
  if (fontDecorationLine) styleText += `text-decoration-line: ${fontDecorationLine};`
  if (fontSpace) styleText += `letter-spacing: ${fontSpace};`
  if (subscript) styleText += `vertical-align: ${subscript}; font-size: smaller;`
  if (shadow) styleText += `text-shadow: ${shadow};`

  const linkID = getTextByPathList(node, ['a:rPr', 'a:hlinkClick', 'attrs', 'r:id'])
  if (linkID) {
    const linkURL = warpObj['slideResObj'][linkID]['target']
    return `<span style="${styleText}"><a href="${linkURL}" target="_blank">${text.replace(/\s/i, '&nbsp;')}</a></span>`
  } 
  return `<span style="${styleText}">${text.replace(/\s/i, '&nbsp;')}</span>`
}