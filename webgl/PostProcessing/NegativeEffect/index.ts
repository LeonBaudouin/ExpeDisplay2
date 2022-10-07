import { Effect } from 'postprocessing'
import fragmentShader from './index.frag'
import * as THREE from 'three'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import { WebGLAppContext } from '~~/webgl'
import gsap from 'gsap'
import { noiseWatch } from '~~/utils/uniforms/customWatcher'

export default class NegativeEffect extends Effect {
  constructor(context: WebGLAppContext) {
    const t = new THREE.TextureLoader().load('/mainTitle.png', (t) => {
      params.ratios.y = t.image.width / t.image.height
    })
    super('Negative', fragmentShader, {
      uniforms: new Map([
        ['uProgress', new THREE.Uniform(new THREE.Vector2())],
        ['uAnimationOffset', new THREE.Uniform(new THREE.Vector2())],
        ['uRatios', new THREE.Uniform(new THREE.Vector2())],
        ['uTexture', new THREE.Uniform(t)],
        ['uNoise', new THREE.Uniform(null)],
      ]),
    })

    const params = reactive({
      progress: { x: 0, y: 0 },
      animationOffset: { x: 0, y: 2 },
      ratios: { x: 0, y: 0 },
      noise: { size: { x: 2048, y: 2048 }, noiseScale: 13, type: 'voronoi' },
    })

    const animIntro = () => {
      const tl = gsap.timeline()
      tl.set(params.progress, { x: 0, y: 1 })
      tl.to(params.progress, { x: 1, ease: 'Power0.easeNone', duration: 2 })
    }

    context.tweakpane.addInput(params, 'animationOffset', {
      label: 'Animation offset',
      x: { step: 0.01 },
      y: { step: 0.01 },
    })
    context.tweakpane.addInput(params, 'progress', { label: 'Progress', min: 0, max: 1 })
    context.tweakpane.addButton({ title: 'Anim 1' }).on('click', animIntro)

    watch(
      () => context.state.isReady,
      (isReady) => {
        if (!isReady) return
        setTimeout(animIntro, 2300)
      },
      { immediate: true }
    )

    watch(
      context.state.pixelSize,
      (pixelSize) => {
        params.ratios.x = pixelSize.x / pixelSize.y
      },
      { immediate: true }
    )

    reactiveUniforms(Object.fromEntries(this.uniforms.entries()), params, { noise: noiseWatch(context, 'voronoi') })
  }
}
