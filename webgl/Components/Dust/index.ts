import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import { extendContext } from '~~/webgl/abstract/Context'

export default class Dust extends AbstractObject<
  WebGLAppContext,
  THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  constructor(context: WebGLAppContext) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Dust', expanded: false }) }))

    const params = reactive({
      color1: '#411500',
      color2: '#432800',
      // noise: { size: { x: 1024, y: 1024 }, noiseScale: 10, octave: 8 },
    })

    this.context.tweakpane.addInput(params, 'color1', { label: 'Color 1' })
    this.context.tweakpane.addInput(params, 'color2', { label: 'Color 2' })
    // addNoiseInput(this.context, params, 'noise', { title: 'Noise', expanded: false })

    const amount = 200
    const geom = new THREE.BufferGeometry()
    geom.setFromPoints(new Array(amount).fill(new THREE.Vector3(0)))

    const indices = new Float32Array(amount)
    for (let index = 0; index < indices.length; index++) indices[index] = index / amount
    geom.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1))

    this.object = new THREE.Points(
      geom,
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 1 },
          uColor1: { value: new THREE.Color() },
          uColor2: { value: new THREE.Color() },
          uNoise: { value: null },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
      })
    )

    // reactiveUniforms(this.object.material.uniforms, params, { noise: noiseWatch(this.context, 'dustNoise') })
    reactiveUniforms(this.object.material.uniforms, params)
  }

  public tick(time: number, delta: number): void {
    this.object.material.uniforms.uTime.value = time * 0.1
  }
}
