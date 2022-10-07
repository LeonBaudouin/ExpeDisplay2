import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import { extendContext } from '~~/webgl/abstract/Context'

export default class Ground extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  constructor(context: WebGLAppContext) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Ground', expanded: false }) }))

    const params = reactive({
      color: '#643400',
      shadowColor: '#160005',
      shadowDensity: 0.33,
    })

    const mesh = this.context.ressources.gltf.scene?.scene.getObjectByName('ground') as THREE.Mesh

    this.object = new THREE.Mesh(
      mesh.geometry,
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uColor: { value: new THREE.Color() },
          uShadowColor: { value: new THREE.Color() },
          uShadowDensity: { value: 0 },
          ...THREE.UniformsLib['fog'],
        },
        fog: true,
      })
    )
    reactiveUniforms(this.object.material.uniforms, params)

    this.context.tweakpane.addInput(params, 'color', { label: 'Ground Color' })
    this.context.tweakpane.addInput(params, 'shadowColor', { label: 'Shadow Color' })
    this.context.tweakpane.addInput(params, 'shadowDensity', { label: 'Shadow Density' })
  }
}
