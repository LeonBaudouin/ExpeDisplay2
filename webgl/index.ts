import * as THREE from 'three'
import { FolderApi, ListApi, TabPageApi } from 'tweakpane'
import lerp from '~~/utils/math/lerp'
import { createContext, extendContext } from './abstract/Context'
import LifeCycle from './abstract/LifeCycle'
import NoiseGenerator from './Components/NoiseGenerator'
import RenderTargetDebugger from './Components/RenderTargetDebugger'
// import { UnrealBloomPass } from './PostProcessing/UnrealBloomPass'
import Ressources from './Ressources'
import MainScene from './Scenes/MainScene'
import Stats from './Stats'
import {
  EdgeDetectionMode,
  Effect,
  EffectComposer,
  EffectPass,
  GodRaysEffect,
  KernelSize,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
} from 'postprocessing'
import NegativeEffect from './PostProcessing/NegativeEffect'

type Scenes = {
  main: MainScene | null
}
type NuxtApp = ReturnType<typeof useNuxtApp> & { $router: ReturnType<typeof useRouter> }
export default class WebGL extends LifeCycle {
  public renderer: THREE.WebGLRenderer

  public ressources: Ressources
  private postProcessing: EffectComposer
  private usePostprocessing: boolean = true

  private stats: Stats | null
  public scenes: Scenes
  private currentScene: keyof Scenes
  private clock: THREE.Clock
  private tweakpane: FolderApi
  public state = reactive({
    isReady: false,
    pixelSize: new THREE.Vector2(),
    pixelRatio: 1,
    screenSize: new THREE.Vector2(),
    averageDelta: 0.016,
  })
  private nuxtApp: NuxtApp
  private renderTargetDebugger: RenderTargetDebugger
  private noiseGenerator: NoiseGenerator
  private globalUniforms = {
    uBloom: { value: 0 },
  }
  public context = createContext({
    clock: () => this.clock,
    renderer: () => this.renderer,
    state: () => this.state,
    tweakpane: () => this.tweakpane as FolderApi | TabPageApi,
    globalUniforms: () => this.globalUniforms,
    ressources: () => this.ressources,
    nuxtApp: () => this.nuxtApp,
    renderTargetDebugger: () => this.renderTargetDebugger,
    noiseGenerator: () => this.noiseGenerator,
  })

  constructor(nuxtApp: any) {
    super()
    this.nuxtApp = nuxtApp

    if (this.nuxtApp.$params.debug) this.stats = new Stats(true)
    this.tweakpane = this.nuxtApp.$tweakpane!

    this.setupRenderer()
    this.ressources = new Ressources(this.renderer)
    this.renderTargetDebugger = new RenderTargetDebugger(this.context)
    this.noiseGenerator = new NoiseGenerator(this.context)

    this.setupClock()
    this.setupScenes()
    this.setupPostProcessing()

    this.currentScene =
      Object.keys(this.scenes!).indexOf(this.nuxtApp.$params.scene || '') > -1
        ? (this.nuxtApp.$params.scene as keyof Scenes)
        : 'main'

    const sceneBlade = this.tweakpane.addBlade({
      view: 'list',
      label: 'Scene',
      options: Object.keys(this.scenes!).map((key) => ({ text: key, value: key })),
      value: this.currentScene,
      index: 0,
    }) as ListApi<string>

    sceneBlade.on('change', ({ value }) => (this.currentScene = value as keyof Scenes))

    this.context.ressources.load('global')
  }

  private setupScenes() {
    const tabs = this.tweakpane.addTab({ pages: [{ title: 'Main' }] })

    const mainPage = tabs.pages[0]

    this.scenes = {
      main: null,
    }

    watch(
      () => this.ressources.progress.global == 1,
      (isLoaded) => {
        if (!isLoaded) return
        setTimeout(() => {
          this.state.isReady = true
        }, 1000)
        this.scenes.main = new MainScene(extendContext(this.context, { tweakpane: mainPage }))
      },
      { immediate: true }
    )
  }

  private setupClock() {
    this.clock = new THREE.Clock(true)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') this.clock.start()
      if (document.visibilityState === 'hidden') this.clock.stop()
    }

    window.addEventListener('visibilitychange', onVisibilityChange, { passive: true })
  }

  private setupRenderer() {
    this.state.pixelRatio = Math.min(window.devicePixelRatio, 1.6)
    const setStateSize = () => {
      this.state.pixelSize.set(window.innerWidth * this.state.pixelRatio, window.innerHeight * this.state.pixelRatio)
      this.state.screenSize.set(window.innerWidth, window.innerHeight)
    }
    setStateSize()
    watch(() => this.state.pixelRatio, setStateSize)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    })

    this.renderer.setClearColor('#ff0000')
    this.renderer.outputEncoding = THREE.LinearEncoding
    this.renderer.debug.checkShaderErrors = this.nuxtApp.$params.debug

    this.stats?.setRenderPanel(this.renderer.getContext())

    watchEffect(() => {
      this.renderer.setSize(this.state.pixelSize.x, this.state.pixelSize.y)
    })
  }

  private setupPostProcessing() {
    this.postProcessing = new EffectComposer(this.renderer)

    watchEffect(() => {
      this.postProcessing.setSize(this.state.pixelSize.x, this.state.pixelSize.y)
    })

    const postProcessing = this.tweakpane.addFolder({ title: 'Post Processing', index: 0, expanded: false })
    postProcessing.addInput(this as any, 'usePostprocessing')

    watch(
      () => this.ressources.progress.global == 1,
      (loaded) => {
        if (!loaded) return

        const renderScene = new RenderPass(this.scenes.main!.scene, this.scenes.main!.camera)
        this.postProcessing.addPass(renderScene)

        const smaaEffect = new SMAAEffect({
          // preset: SMAAPreset.HIGH,
          edgeDetectionMode: EdgeDetectionMode.LUMA,
        })

        const negativeEffect = new NegativeEffect(this.context)

        const godRaysEffect = new GodRaysEffect(
          this.scenes.main!.camera,
          this.scenes.main!.face!.sun,
          // this.scenes.main!.test,
          {
            kernelSize: KernelSize.MEDIUM,
            height: 480,
            decay: 0.77,
            density: 0.8,
            weight: 1.22,
            exposure: 0.7,
            samples: 60,
            clampMax: 1.0,
          }
          // {
          //   kernelSize: KernelSize.VERY_SMALL,
          //   height: 240,
          //   decay: 0.81,
          //   density: 0.18,
          //   weight: 3.32,
          //   exposure: 0.16,
          //   samples: 15,
          //   clampMax: 1.0,
          // }
        )

        postProcessing.addInput(godRaysEffect.godRaysMaterial, 'decay')
        postProcessing.addInput(godRaysEffect.godRaysMaterial, 'density')
        postProcessing.addInput(godRaysEffect.godRaysMaterial, 'weight')
        postProcessing.addInput(godRaysEffect.godRaysMaterial, 'exposure')

        this.postProcessing.addPass(new EffectPass(this.scenes.main!.camera, smaaEffect, godRaysEffect, negativeEffect))
        // this.postProcessing.addPass(new EffectPass(this.scenes.main!.camera, godRaysEffect, negativeEffect))
        // this.postProcessing.addPass(new EffectPass(this.scenes.main!.camera, negativeEffect))
      }
    )
  }

  public tick() {
    this.stats?.update()

    const deltaTime = this.clock.getDelta()
    this.state.averageDelta = lerp(this.state.averageDelta, deltaTime, 0.03)
    const elapsedTime = this.clock.elapsedTime

    const currentScene = this.scenes[this.currentScene]

    if (currentScene) currentScene.tick(elapsedTime, deltaTime)

    this.stats?.beforeRender()
    if (currentScene) {
      if (this.usePostprocessing) {
        const renderPass = this.postProcessing.passes[0] as any
        renderPass.camera = currentScene.camera
        renderPass.scene = currentScene.scene
        // const bloomPass = this.postProcessing.passes[1] as any
        // bloomPass.camera = currentScene.camera
        // bloomPass.scene = currentScene.scene
        // bloomPass.effects[1].camera = currentScene.camera
        // bloomPass.effects[1].blurPass.camera = currentScene.camera
        // bloomPass.effects[1].depthMaskPass.camera = currentScene.camera
        // bloomPass.effects[1].godRaysPass.camera = currentScene.camera
        // bloomPass.effects[1].renderPassLight.camera = currentScene.camera

        this.postProcessing.render(deltaTime)
      } else {
        this.renderer.render(currentScene.scene, currentScene.camera)
      }
    }
    this.renderTargetDebugger.tick()
    this.stats?.afterRender()
  }
}

export type WebGLAppContext = WebGL['context']
