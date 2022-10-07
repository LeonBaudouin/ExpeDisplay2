import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import { extendContext } from '~~/webgl/abstract/Context'

export default class Background extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  constructor(context: WebGLAppContext) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Background', expanded: false }) }))

    const params = reactive({
      color: '#ffaa0f',
    })

    this.object = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        depthWrite: false,
        uniforms: { ...THREE.UniformsLib['fog'], uColor: { value: new THREE.Color() } },
        fog: true,
      })
    )

    reactiveUniforms(this.object.material.uniforms, params)

    this.context.tweakpane.addInput(params, 'color')

    this.object.renderOrder = -2
    this.object.frustumCulled = false
  }
}
