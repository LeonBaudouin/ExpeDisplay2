import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import particlesFragment from './index.frag'
import particlesVertex from './index.vert'
import { WebGLAppContext } from '~~/webgl'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import { extendContext } from '~~/webgl/abstract/Context'

export type CubesParams = {
  textureSize: THREE.Vector2
}

export type CubesData = Required<CubesParams>

export default class Cubes extends AbstractObject<
  WebGLAppContext,
  THREE.InstancedMesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  public data: CubesData

  public static DEFAULT_PARAMS: Omit<CubesData, 'textureSize'> = reactive({})

  constructor(context: WebGLAppContext, params: CubesParams) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Mesh' }) }))

    Object.assign(params, { ...Cubes.DEFAULT_PARAMS, ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as CubesData

    const mat = new THREE.ShaderMaterial({
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      side: THREE.BackSide,
      uniforms: {
        uPosTexture: { value: null },
        uPreviousPosTexture: { value: null },
        uVelocityTexture: { value: null },
        uSize: { value: 0.1 },
      },
    })

    reactiveUniforms(mat.uniforms, this.data)

    const geometry = new THREE.InstancedBufferGeometry()

    geometry.copy(new THREE.BoxBufferGeometry())

    geometry.instanceCount = params.textureSize.x * params.textureSize.y

    const index = new Float32Array(params.textureSize.x * params.textureSize.y)

    for (let i = 0; i < params.textureSize.x * params.textureSize.y; i++) index[i] = i
    geometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(index, 1, false))

    const pixelPos = new Float32Array(params.textureSize.x * params.textureSize.y * 2)
    for (let i = 0; i < params.textureSize.x * params.textureSize.y; i++) {
      pixelPos[i * 2] = (i % params.textureSize.x) / params.textureSize.x
      pixelPos[i * 2 + 1] = Math.floor(i / params.textureSize.x) / params.textureSize.y
    }
    geometry.setAttribute('aPixelPosition', new THREE.InstancedBufferAttribute(pixelPos, 2, false))

    this.object = new THREE.InstancedMesh(geometry, mat, params.textureSize.x * params.textureSize.y)
  }

  public setTextures(
    positionTexture: THREE.Texture,
    previousPositionTexture: THREE.Texture,
    velocityTexture: THREE.Texture
  ): void {
    this.object.material.uniforms.uPosTexture.value = positionTexture
    this.object.material.uniforms.uPreviousPosTexture.value = previousPositionTexture
    this.object.material.uniforms.uVelocityTexture.value = velocityTexture
  }
}
