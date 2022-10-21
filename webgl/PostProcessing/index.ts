import {
  EdgeDetectionMode,
  EffectComposer,
  EffectPass,
  GodRaysEffect,
  KernelSize,
  RenderPass,
  SMAAEffect,
} from 'postprocessing'
import * as THREE from 'three'
import WebGL, { WebGLAppContext } from '..'
import AbstractComponent from '../abstract/AbstractComponent'
import NegativeEffect from './NegativeEffect'

export default class PostProcessing extends AbstractComponent {
  private composer: EffectComposer
  private scenes: WebGL['scenes']
  public negativeEffect: NegativeEffect
  public godRaysEffect: GodRaysEffect
  private SMAAEffect: SMAAEffect
  private renderTarget: THREE.WebGLRenderTarget

  constructor(context: WebGLAppContext, scenes: WebGL['scenes']) {
    super(context)

    this.composer = new EffectComposer(this.context.renderer)
    this.renderTarget = new THREE.WebGLRenderTarget(this.context.state.pixelSize.x, this.context.state.pixelSize.y, {
      depthBuffer: false,
      stencilBuffer: false,
    })
    this.scenes = scenes

    watchEffect(() => {
      this.composer.setSize(this.context.state.pixelSize.x, this.context.state.pixelSize.y)
      this.renderTarget.setSize(this.context.state.pixelSize.x, this.context.state.pixelSize.y)
    })

    const postProcessing = this.context.tweakpane.addFolder({ title: 'Post Processing', index: 0, expanded: false })

    // watch(
    //   () => this.ressources.progress.global == 1,
    //   (loaded) => {
    //     if (!loaded) return

    const renderScene = new RenderPass(this.scenes.main!.scene, this.scenes.main!.camera)
    this.composer.addPass(renderScene)

    this.SMAAEffect = new SMAAEffect({
      // preset: SMAAPreset.HIGH,
      edgeDetectionMode: EdgeDetectionMode.LUMA,
    })

    this.negativeEffect = new NegativeEffect()

    this.context.tweakpane.addInput(this.negativeEffect.data, 'luminosity', { min: 0, max: 1 })

    this.godRaysEffect = new GodRaysEffect(
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

    postProcessing.addInput(this.godRaysEffect.godRaysMaterial, 'decay')
    postProcessing.addInput(this.godRaysEffect.godRaysMaterial, 'density')
    postProcessing.addInput(this.godRaysEffect.godRaysMaterial, 'weight')
    postProcessing.addInput(this.godRaysEffect.godRaysMaterial, 'exposure')

    this.composer.addPass(
      new EffectPass(this.scenes.main!.camera, this.SMAAEffect, this.godRaysEffect, this.negativeEffect)
    )

    // this.postProcessing.addPass(new EffectPass(this.scenes.main!.camera, godRaysEffect, negativeEffect))
    // this.postProcessing.addPass(new EffectPass(this.scenes.main!.camera, negativeEffect))
    // this.postProcessing.addPass(new EffectPass(this.sc enes.main!.camera, smaaEffect, godRaysEffect))
  }

  public setCurrentScene(currentScene: { scene: THREE.Scene; camera: THREE.Camera }) {
    // const renderPass = this.composer.passes[0] as any
    // renderPass.camera = currentScene.camera
    // renderPass.scene = currentScene.scene
    this.composer.setMainCamera(currentScene.camera)
    this.composer.setMainScene(currentScene.scene)
  }

  public tick(time: number, delta: number): void {
    if (this.scenes.text) {
      this.context.renderer.setRenderTarget(this.renderTarget)
      this.context.renderer.render(this.scenes.text.scene, this.scenes.text.camera)
      this.context.renderer.setRenderTarget(null)
      this.negativeEffect.uniforms.get('uTexture')!.value = this.renderTarget.texture
    }

    this.composer.render(delta)
  }
}
