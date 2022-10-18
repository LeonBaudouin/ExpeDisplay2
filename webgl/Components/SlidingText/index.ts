import * as THREE from 'three'
import { Font } from 'three/examples/jsm/loaders/FontLoader'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import { TextRect, WebGLAppContext } from '~~/webgl'
import AbstractMaterial from '~~/webgl/abstract/AbstractMaterial'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import MSDFTextGeometry from '~~/webgl/libs/MSDFTextGeometry'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'

export type SlidingTextData = {
  opacity: number
  color: THREE.ColorRepresentation
  map: THREE.Texture | null
  threshold: number
  alphaTest: number
  strokeColor: THREE.ColorRepresentation
  strokeOutsetWidth: number
  strokeInsetWidth: number
  slide: { x: number; y: number }
  text: string
  isSmall: boolean
}

export type SlidingTextParams = Partial<SlidingTextData>

export default class SlidingText extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<MSDFTextGeometry, THREE.ShaderMaterial>
> {
  private static DEFAULT_PARAMS: () => SlidingTextData = () =>
    reactive({
      opacity: 1,
      color: '#ffffff',
      map: null,
      threshold: 0.05,
      alphaTest: 0.01,
      strokeColor: '#ff0000',
      strokeOutsetWidth: 0.0,
      strokeInsetWidth: 0.3,
      slide: { x: 0, y: 0 },
      text: '',
      isSmall: false,
    })

  public data: SlidingTextData

  constructor(context: WebGLAppContext, font: Font, params: SlidingTextParams) {
    super(context)

    Object.assign(params, { ...SlidingText.DEFAULT_PARAMS(), ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as SlidingTextData

    const geometry = new MSDFTextGeometry({
      font: font.data,
      text: this.data.text,
      align: 'center',
    })

    watch(
      () => this.data.text,
      (text) => {
        geometry.update({
          font: font.data,
          text: text,
          align: 'center',
        })
      }
    )

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      defines: {
        IS_SMALL: this.data.isSmall,
      },
      extensions: {
        derivatives: true,
      },
      uniforms: {
        uOpacity: { value: 0 },
        uColor: { value: new THREE.Color() },
        uMap: { value: null },
        uThreshold: { value: 0 },
        uAlphaTest: { value: 0 },
        uStrokeColor: { value: new THREE.Color() },
        uStrokeOutsetWidth: { value: 0 },
        uStrokeInsetWidth: { value: 0 },
        uSlide: { value: new THREE.Vector2() },
      },
      vertexShader,
      fragmentShader,
    })

    reactiveUniforms(material.uniforms, this.data)
    this.object = new THREE.Mesh(geometry, material)
  }

  public updatePosition({ x, y, scale }: TextRect) {
    this.object.position.x = (-this.object.geometry.layout.width / 2) * scale + x
    this.object.position.y = (this.object.geometry.layout.xHeight / 2) * scale + y
    this.object.scale.setScalar(scale)
  }

  tick(time: number, delta: number) {}
}
