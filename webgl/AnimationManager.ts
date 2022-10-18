import gsap from 'gsap'
import WebGL from '.'

export default class AnimationManager {
  private webgl: WebGL
  constructor(webgl: WebGL) {
    this.webgl = webgl

    watch(
      () => this.webgl.state.isReady,
      (isReady) => {
        if (isReady) this.intro()
      },
      { immediate: true }
    )
  }

  private intro() {
    const mainTimeline = gsap.timeline()
    mainTimeline.add([
      this.webgl.postProcessing.negativeEffect.animFade(),
      gsap.delayedCall(0, this.webgl.scenes.main!.mainCamera.animate),
    ])
    mainTimeline.add(this.webgl.scenes.main!.face!.animIntro(), '+=0')
    mainTimeline.add(this.webgl.scenes.text!.animIntro(), '-=1')
  }
}
