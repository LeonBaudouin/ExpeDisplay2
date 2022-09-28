import * as THREE from 'three'
import { WebGLAppContext } from '~/webgl'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import { extendContext } from '~~/webgl/abstract/Context'
import DebugCamera from '~~/webgl/Components/Camera/DebugCamera'
import SimpleCamera from '~~/webgl/Components/Camera/SimpleCamera'
import Circle from '~~/webgl/Components/Circle'
import Particles from '~~/webgl/Components/Particles'

export type MainSceneContext = WebGLAppContext & { scene: MainScene }

export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private debugCamera: DebugCamera
  private mainCamera: SimpleCamera

  private particles: Particles
  private testCube: THREE.Mesh

  private sceneState = reactive({})

  private params = {
    debugCam: false,
  }

  constructor(context: WebGLAppContext) {
    super(extendContext(context, { scene: () => this }))

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)

    this.debugCamera = new DebugCamera(this.context, { defaultPosition: new THREE.Vector3(0, 0, 15) })
    this.scene.add(this.debugCamera.object)

    this.mainCamera = new SimpleCamera(this.context, { defaultPosition: new THREE.Vector3(0, 0, 15) })
    this.scene.add(this.mainCamera.object)

    this.camera = this.params.debugCam ? this.debugCamera.object : this.mainCamera.object

    this.context.tweakpane
      .addInput(this.params, 'debugCam', { label: 'Debug Cam' })
      .on('change', ({ value }) => (this.camera = value ? this.debugCamera.object : this.mainCamera.object))

    this.setObjects()
  }

  private setObjects() {
    // this.particles = new Particles(this.context, { textureSize: new THREE.Vector2(64, 64) })
    // this.scene.add(this.particles.object)
    // this.testCube = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshStandardMaterial())
    // this.scene.add(this.testCube)
    // this.testCube.castShadow = true
    // const ground = new THREE.Mesh(
    //   new THREE.PlaneBufferGeometry(20, 20).rotateX(-Math.PI / 2).translate(0, -1, 0),
    //   new THREE.MeshStandardMaterial()
    // )
    // ground.receiveShadow = true
    // const light = new THREE.DirectionalLight(0xffffff)
    // light.position.y = 5
    // light.lookAt(0, 0, 0)
    // light.castShadow = true
    // this.context.renderer.shadowMap.enabled = true
    // this.scene.add(ground, light)

    const obj = new Circle(this.context)
    this.scene.add(obj.object)
  }

  public tick(time: number, delta: number): void {
    // this.debugCamera.tick(time, delta)
    // this.particles.tick(time, delta)
    // this.testCube.rotateX(0.02)
    // this.testCube.rotateY(0.01)
  }
}
