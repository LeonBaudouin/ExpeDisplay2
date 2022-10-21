import gsap from 'gsap'
import WebGL, { WebGLAppContext } from '.'
import AbstractComponent from './abstract/AbstractComponent'

export default class AnimationManager extends AbstractComponent {
  private webgl: WebGL
  constructor(context: WebGLAppContext, webgl: WebGL) {
    super(context)
    this.webgl = webgl

    watch(
      () => this.webgl.state.isReady,
      (isReady) => {
        if (isReady) this.intro()
      },
      { immediate: true }
    )

    this.context.tweakpane.addButton({ title: 'Test' }).on('click', () => {
      this.test()
    })
  }

  private intro() {
    const mainTimeline = gsap.timeline()
    mainTimeline.add([
      this.webgl.postProcessing.negativeEffect.animFade(),
      gsap.delayedCall(0, this.webgl.scenes.main!.mainCamera.animate),
    ])
    mainTimeline.add(this.webgl.scenes.main!.animFace(), '+=0')
    mainTimeline.add(this.webgl.scenes.text!.animIntro(), '-=1')
  }

  private test() {
    const faceData = this.webgl.scenes.main!.face!.data
    faceData.useMouse = 0
    gsap.fromTo(
      faceData.sdf,
      {
        x: -6,
        y: 0.35,
        z: 3.47,
        w: 3.45,
      },
      {
        x: -0.5,
        y: 0.35,
        z: 3.47,
        w: 3.45,
        ease: 'Power2.easeOut',
        duration: 6,
      }
    )
    const material = this.webgl.postProcessing.godRaysEffect.godRaysMaterial
    gsap.fromTo(material, { decay: 0.77 }, { decay: 0.92, duration: 4, ease: 'Power3.easeOut' })
  }
}
