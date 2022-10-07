import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import gsap from 'gsap'

export default class MainTitle extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  constructor(context: WebGLAppContext) {
    super(context)

    const params = reactive({
      progress: { x: 0, y: 0 },
      animationOffset: { x: 0, y: 2 },
      ratios: { x: 0, y: 0 },
    })
    // this.context.tweakpane.addInput(params, 'animationOffset', {
    //   label: 'Animation offset',
    //   x: { step: 0.01 },
    //   y: { step: 0.01 },
    // })
    // this.context.tweakpane.addInput(params, 'progress', { label: 'Progress', min: 0, max: 1 })
    // this.context.tweakpane.addButton({ title: 'Anim 1' }).on('click', () => {
    //   const tl = gsap.timeline()
    //   tl.set(params.progress, { x: 0, y: 1 })
    //   tl.to(params.progress, { x: 1, ease: 'Power0.easeNone', duration: 2 })
    //   // tl.to(params.progress, { y: 1, ease: 'Power2.easeInOut', duration: 1, delay: -0.7 })
    // })

    // watch(
    //   this.context.state.pixelSize,
    //   (pixelSize) => {
    //     params.ratios.x = pixelSize.x / pixelSize.y
    //   },
    //   { immediate: true }
    // )

    this.object = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uTexture: {
            value: new THREE.TextureLoader().load('/mainTitle.png', (t) => {
              // t.minFilter = THREE.NearestFilter
              // t.magFilter = THREE.NearestFilter
              params.ratios.y = t.image.width / t.image.height
            }),
          },
          uProgress: { value: new THREE.Vector2() },
          uAnimationOffset: { value: new THREE.Vector2() },
          uRatios: { value: new THREE.Vector2() },
        },
        transparent: true,
      })
    )
    reactiveUniforms(this.object.material.uniforms, params)

    this.object.renderOrder = -1
    this.object.frustumCulled = false
  }
}
