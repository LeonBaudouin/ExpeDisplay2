import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import { extendContext } from '~~/webgl/abstract/Context'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import SlidingText from '~~/webgl/Components/SlidingText'
import gsap from 'gsap'

export type TextSceneContext = WebGLAppContext & { scene: TextScene }

export default class TextScene extends AbstractScene<WebGLAppContext, THREE.OrthographicCamera> {
  private title: SlidingText
  private subtitle: SlidingText
  constructor(context: WebGLAppContext, { bodyFont, titleFont }: { bodyFont: Font; titleFont: Font }) {
    super(extendContext(context, { scene: () => this }))

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)

    this.setupCamera()
    this.setupTitle(titleFont)
    this.setupSubtitle(bodyFont)
  }

  public animIntro() {
    const tl = gsap.timeline()
    tl.to(this.title.data.slide, { x: 0, ease: 'Power4.easeOut', duration: 1 })
    tl.to(this.subtitle.data.slide, { y: 0, ease: 'Power4.easeOut', duration: 0.8, delay: -0.5 })
    return tl
  }

  private setupCamera() {
    this.camera = new THREE.OrthographicCamera()
    this.camera.position.z = 100

    watchEffect(() => {
      const { x, y } = this.context.state.screenSize

      this.camera.left = -x / 2
      this.camera.right = x / 2
      this.camera.top = -y / 2
      this.camera.bottom = y / 2
      this.camera.updateProjectionMatrix()
    })
  }

  private setupTitle(font: Font) {
    this.title = new SlidingText(this.context, font, {
      map: new THREE.TextureLoader().load('/msdf/ClashDisplay/atlas.png', (t) => t.flipY),
      slide: { x: 1, y: 0 },
      text: 'EXPERIMENTS',
    })
    this.linkTextBox('title', this.title)
    this.scene.add(this.title.object)
  }

  private setupSubtitle(font: Font) {
    this.subtitle = new SlidingText(this.context, font, {
      map: new THREE.TextureLoader().load('/msdf/Satoshi/atlas.png', (t) => t.flipY),
      slide: { x: 0, y: -1 },
      text: 'Some ideas that popped into my head',
      isSmall: true,
      alphaTest: 0.1,
      threshold: 0.2,
    })
    this.linkTextBox('subtitle', this.subtitle)
    this.scene.add(this.subtitle.object)
  }

  private linkTextBox(name: string, text: SlidingText) {
    watch(
      () => this.context.state.textRects[name],
      (textRect) => {
        if (!textRect) return
        text.updatePosition(textRect)
      },
      { immediate: true }
    )
  }

  public tick(time: number, delta: number): void {
    this.title.tick(time, delta)
  }
}
