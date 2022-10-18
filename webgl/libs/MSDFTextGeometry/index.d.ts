import { BufferGeometry } from 'three'
import { Font } from 'three/examples/jsm/loaders/FontLoader'

type Options = {
  font: Font['data'] // (required) the BMFont definition which holds chars, kernings, etc
  flipY?: boolean // (boolean): whether the texture will be Y-flipped (default true)
  multipage?: boolean // (boolean): whether to construct this geometry with an extra buffer containing page IDs. This is necessary for multi-texture fonts (default false)
  text?: string // (string) the text to layout. Newline characters (\n) will cause line breaks
  width?: number // (number, optional) the desired width of the text box, causes word-wrapping and clipping in "pre" mode. Leave as undefined to remove
  mode?: 'pre' | 'nowrap' // (string) a mode for word-wrapper; can be 'pre' (maintain spacing), or 'nowrap' (collapse whitespace but only break on newline characters), otherwise assumes normal word-wrap behaviour (collapse whitespace, break at width or newlines)
  align?: 'left' | 'center' | 'right' // (string) can be "left", "center" or "right" (default: left)
  letterSpacing?: number // (number) the letter spacing in pixels (default: 0)
  lineHeight?: number // (number) the line height in pixels (default to font.common.lineHeight)
  tabSize?: number // (number) the number of spaces to use in a single tab (default 4)
  start?: number // (number) the starting index into the text to layout (default 0)
  end?: number // (number) the ending index (exclusive) into the text to layout (default text.length)
  'word-wrapping'?: boolean // (default behaviour)
}

type Layout = {
  width: number
  height: number
  descender: number
  ascender: number
  xHeight: number
  baseline: number
  capHeight: number
  lineHeight: number
  linesTotal: number
  lettersTotal: number
  wordsTotal: number
}

declare class MSDFTextGeometry extends BufferGeometry {
  constructor(options: Options)
  update(options: Options)
  layout: Layout
}

export = MSDFTextGeometry
