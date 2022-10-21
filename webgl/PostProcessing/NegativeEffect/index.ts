import gsap from 'gsap'
import { Effect } from 'postprocessing'
import * as THREE from 'three'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import fragmentShader from './index.frag'

export default class NegativeEffect extends Effect {
  public data = reactive({
    backgroundColor: '#1c1106',
    fade: 1,
    luminosity: 0,
  })

  constructor() {
    super('Negative', fragmentShader, {
      uniforms: new Map([
        ['uTexture', new THREE.Uniform(null)],
        ['uBackgroundColor', new THREE.Uniform(new THREE.Color())],
        ['uFade', new THREE.Uniform(0)],
        ['uLuminosity', new THREE.Uniform(0)],
      ]),
    })

    reactiveUniforms(Object.fromEntries(this.uniforms.entries()), this.data)
  }

  public animFade() {
    return gsap.to(this.data, { fade: 0, duration: 2, ease: 'Power2.easeOut' })
  }
}
