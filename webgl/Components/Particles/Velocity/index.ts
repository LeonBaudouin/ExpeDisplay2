import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import GPGPU from '~~/utils/GPGPU'
import vertex from '../default.vert'
import velocityFragment from './index.frag'
import { WebGLAppContext } from '~~/webgl'
import AbstractComponent from '~~/webgl/abstract/AbstractComponent'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import { extendContext } from '~~/webgl/abstract/Context'

export type VelocityParams = {
  textureSize: THREE.Vector2
}

export type VelocityData = Required<VelocityParams>

export default class Velocity extends AbstractComponent<WebGLAppContext> {
  private velocity: GPGPU

  public data: VelocityData

  public static DEFAULT_PARAMS: Omit<VelocityData, 'textureSize' | ''> = reactive({})

  constructor(context: WebGLAppContext, params: VelocityParams) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Speed Simulation' }) }))

    Object.assign(params, { ...Velocity.DEFAULT_PARAMS, ...params })

    this.data = (isReactive(params) ? params : reactive(params)) as VelocityData
    const velocityInitTexture = new THREE.DataTexture(
      new Float32Array(new Array(params.textureSize.x * params.textureSize.y * 4).fill(0.0001)),
      params.textureSize.x,
      params.textureSize.y,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    velocityInitTexture.needsUpdate = true

    const velocityShader = new THREE.ShaderMaterial({
      fragmentShader: velocityFragment,
      vertexShader: vertex,
      uniforms: {
        uFbo: { value: null },
        uPositionFbo: { value: null },
        uTextureSize: { value: params.textureSize },
      },
    })

    reactiveUniforms(velocityShader.uniforms, this.data)

    this.velocity = new GPGPU({
      size: params.textureSize,
      renderer: this.context.renderer,
      shader: velocityShader,
      initTexture: velocityInitTexture,
      renderTargetParams: { type: THREE.FloatType },
    })

    this.context.renderTargetDebugger.registerRenderTarget('velocity', this.velocity.getBuffer())
  }

  public updateTexture(tex: THREE.Texture) {
    this.velocity.quad!.material.uniforms.uPositionFbo.value = tex
  }

  public setAttractorTexture(positionTexture: THREE.Texture) {
    this.velocity.quad!.material.uniforms.uAttractorsTexture.value = positionTexture
  }

  public getTexture() {
    return this.velocity.outputTexture
  }

  public tick(time: number, delta: number): void {
    this.velocity.render()
  }
}
