import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import { extendContext } from '~~/webgl/abstract/Context'
import addNoiseInput from '~~/utils/tweakpane/addNoiseInput'
import { noiseWatch } from '~~/utils/uniforms/customWatcher'
import addTransformInput from '~~/utils/tweakpane/addTransformInput'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'

export type LightData = ReturnType<typeof Light['DEFAULT_PARAMS']>
export type LightParams = Partial<LightData>

export default class Light extends AbstractObject<
  MainSceneContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  public static DEFAULT_PARAMS = () => ({
    color: '#623700',
    alpha: 1,
    highlightColor: '#726a00',
    highlight: { min: 0.26, max: 1 },
    center: { x: 0.5, y: 0.22 },
    capsule: { x: 0.61, y: 0.11, z: 0.51 },
    sdfStep: { min: -0.484, max: 0.2 },
    noise: { size: { x: 512, y: 512 }, noiseScale: 10, octave: 8 },
    noiseScale: { x: 0.09, y: 1.1 },
    noiseIntensity: { min: 0.45, max: 0.81 },
    controls: false,
  })

  constructor(
    context: MainSceneContext,
    meshName: string,
    params: LightParams = {},
    transform: { position?: THREE.Vector3; rotation?: THREE.Euler; scale?: THREE.Vector3 } = {}
  ) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: meshName, expanded: false }) }))

    Object.assign(params, { ...Light.DEFAULT_PARAMS(), ...params })
    const data = (isReactive(params) ? params : reactive(params)) as LightData

    // const params = reactive({
    //   // color: '#ffd39a',
    //   // alpha: 1,
    //   // highlightColor: '#ffefda',
    //   // highlight: { min: 0.74, max: 1 },
    //   // center: { x: 0.5, y: 0.06 },
    //   // capsule: { x: 0.61, y: 0.11, z: 0.51 },
    //   // sdfStep: { min: -0.42, max: 0.17 },
    //   color: '#623700',
    //   alpha: 1,
    //   // highlightColor: '#ffb039',
    //   highlightColor: '#726a00',
    //   highlight: { min: 0.26, max: 1 },
    //   center: { x: 0.5, y: 0.22 },
    //   capsule: { x: 0.61, y: 0.11, z: 0.51 },
    //   sdfStep: { min: -0.484, max: 0.2 },
    //   noise: { size: { x: 512, y: 512 }, noiseScale: 10, octave: 8 },
    //   noiseScale: { x: 0.09, y: 1.1 },
    //   noiseIntensity: { min: 0.45, max: 0.81 },
    // })

    this.context.tweakpane.addInput(data, 'color', { label: 'Color' })
    this.context.tweakpane.addInput(data, 'alpha', { label: 'Alpha', min: 0, max: 1 })
    this.context.tweakpane.addInput(data, 'highlightColor', { label: 'Highlight Color' })
    this.context.tweakpane.addInput(data, 'highlight', { label: 'Highlight', min: 0, max: 1 })
    this.context.tweakpane.addInput(data, 'center', {
      label: 'Center',
      x: { min: -1, max: 1 },
      y: { min: -1, max: 1 },
    })
    this.context.tweakpane.addInput(data, 'sdfStep', {
      label: 'Sdf remap',
      min: -1,
      max: 1,
    })
    this.context.tweakpane.addInput(data, 'capsule', {
      label: 'Capsule',
      x: { min: 0, max: 1 },
      y: { min: 0, max: 1 },
      z: { min: 0, max: 1 },
    })
    addNoiseInput(this.context, data, 'noise', { title: 'Noise', expanded: false })
    this.context.tweakpane.addInput(data, 'noiseScale', {
      label: 'Noise Scale',
      x: { step: 0.01 },
      y: { step: 0.01 },
    })
    this.context.tweakpane.addInput(data, 'noiseIntensity', {
      label: 'Noise Intensity',
      min: 0,
      max: 1,
    })
    const mesh = this.context.ressources.gltf.scene?.scene.getObjectByName(meshName) as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.ShaderMaterial
    >

    if ('position' in transform) mesh.position.copy(transform.position!)
    if ('scale' in transform) mesh.scale.copy(transform.scale!)
    if ('rotation' in transform) mesh.rotation.copy(transform.rotation!)

    mesh.material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uColor: { value: new THREE.Color() },
        uHighlightColor: { value: new THREE.Color() },
        uHighlight: { value: new THREE.Vector2() },
        uCenter: { value: new THREE.Vector2() },
        uSdfStep: { value: new THREE.Vector2() },
        uCapsule: { value: new THREE.Vector3() },
        uAlpha: { value: 0 },
        uNoise: { value: null },
        uNoiseScale: { value: new THREE.Vector2() },
        uNoiseIntensity: { value: new THREE.Vector2() },
        uTime: { value: 0 },
        uSeed: { value: Math.random() },
      },
      transparent: true,
      side: THREE.DoubleSide,
    })

    reactiveUniforms(mesh.material.uniforms, data, { noise: noiseWatch(this.context, 'lightNoise') })

    this.object = mesh

    addTransformInput(this.context, data, 'controls', this.object, { title: 'Controls' })
  }

  public tick(time: number, delta: number): void {
    this.object.material.uniforms.uTime.value = time
  }
}
