import { WebGLAppContext } from '~~/webgl'
import * as THREE from 'three'
import fragmentShader from './index.frag'
import voronoiShader from './voronoi.frag'
import vertexShader from './index.vert'

export default class NoiseGenerator {
  private context: WebGLAppContext
  private quad: THREE.Mesh
  private camera = new THREE.PerspectiveCamera()
  private simplexMaterial: THREE.ShaderMaterial
  private voronoiMaterial: THREE.ShaderMaterial
  private renderTargets = new Map<string, THREE.WebGLRenderTarget>()

  constructor(context: WebGLAppContext) {
    this.context = context

    this.simplexMaterial = new THREE.ShaderMaterial({
      uniforms: { uNoiseScale: { value: 4 }, uOctave: { value: 20 } },
      fragmentShader,
      vertexShader,
      depthTest: false,
    })
    this.voronoiMaterial = new THREE.ShaderMaterial({
      uniforms: { uNoiseScale: { value: 4 } },
      fragmentShader: voronoiShader,
      vertexShader,
      depthTest: false,
    })

    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.simplexMaterial)
    this.quad.renderOrder = -100
    this.quad.frustumCulled = false
  }

  public getRenderTarget(id: string) {
    if (!this.renderTargets.has(id)) {
      const renderTarget = new THREE.WebGLRenderTarget(0, 0, { depthBuffer: false, stencilBuffer: false })
      this.context.renderTargetDebugger.registerRenderTarget(id, renderTarget)
      this.renderTargets.set(id, renderTarget)
    }
    return this.renderTargets.get(id)!
  }

  public render(
    id: string,
    {
      size = { x: 1024, y: 1024 },
      noiseScale = 4,
      octave = 20,
      force = true,
      type = 'simplex',
    }: {
      size?: { x: number; y: number }
      noiseScale?: number
      octave?: number
      force?: boolean
      type?: 'simplex' | 'voronoi'
    } = {}
  ) {
    const alreadyExist = this.renderTargets.has(id)
    const renderTarget = this.getRenderTarget(id)
    if (alreadyExist && !force) return renderTarget.texture
    this.simplexMaterial.uniforms.uNoiseScale.value = noiseScale
    this.voronoiMaterial.uniforms.uNoiseScale.value = noiseScale
    this.simplexMaterial.uniforms.uOctave.value = octave
    renderTarget.setSize(size.x, size.y)
    this.quad.material = type === 'simplex' ? this.simplexMaterial : this.voronoiMaterial
    const lastTarget = this.context.renderer.getRenderTarget()
    this.context.renderer.setRenderTarget(renderTarget)
    this.context.renderer.render(this.quad, this.camera)
    this.context.renderer.setRenderTarget(lastTarget)
    return renderTarget.texture
  }
}
