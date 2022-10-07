import * as THREE from 'three'
import { WebGLAppContext } from '~/webgl'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import { extendContext } from '~~/webgl/abstract/Context'
import Background from '~~/webgl/Components/Background'
import DebugCamera from '~~/webgl/Components/Camera/DebugCamera'
import RotationCamera from '~~/webgl/Components/Camera/RotationCamera'
import Dust from '~~/webgl/Components/Dust'
import Face from '~~/webgl/Components/Face'
import Ground from '~~/webgl/Components/Ground'
import Light, { LightParams } from '~~/webgl/Components/Light'
import MainTitle from '~~/webgl/Components/MainTitle'

export type MainSceneContext = WebGLAppContext & { scene: MainScene }

export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private debugCamera: DebugCamera
  private mainCamera: RotationCamera

  private lights: Light[]
  private dust: Dust
  public face?: Face
  public test: THREE.Mesh

  private sceneState = reactive({})

  protected declare context: MainSceneContext

  private params = {
    debugCam: false,
  }

  constructor(context: WebGLAppContext) {
    super(extendContext(context, { scene: () => this }))

    this.scene = new THREE.Scene()
    // this.scene.background = new THREE.Color(0x181818).convertSRGBToLinear()
    const param = { color: '#2f1e0c' }
    this.scene.background = new THREE.Color(param.color)
    const fog = new THREE.FogExp2(param.color, 0.08)
    this.scene.fog = fog

    const fogFolder = this.context.tweakpane.addFolder({ title: 'Fog', expanded: false })
    fogFolder.addInput(param, 'color').on('change', ({ value }) => {
      fog.color.set(value)
      ;(this.scene.background as THREE.Color).set(value)
    })
    fogFolder.addInput(fog, 'density')

    // const defPos = new THREE.Vector3(-1.5406782749974997, 0.39232675732562555, 13.3464533630925)
    // const defRotation = new THREE.Euler(-0.05352377193980043, 0.13456646772957442, 0.007187528533985277)
    // const target = new THREE.Vector3(-3.2719234256248573, -0.2917872685609845, 0.5771623666098459)

    const cam = this.context.ressources.gltf.scene?.cameras[0]!
    const defPos = cam.getWorldPosition(new THREE.Vector3())
    const defRotation = new THREE.Euler().setFromQuaternion(cam.getWorldQuaternion(new THREE.Quaternion()))
    const target = this.context.ressources.gltf.scene?.cameras[1]!.getWorldPosition(new THREE.Vector3())!

    // const target = new THREE.Vector3(-2.2085442543029785, -0.045475073158741, 3.5347142219543457)
    this.debugCamera = new DebugCamera(this.context, { defaultPosition: defPos, defaultRotation: defRotation })
    this.mainCamera = new RotationCamera(this.context, {
      defaultPosition: defPos,
      defaultRotation: defRotation,
      target,
    })
    this.debugCamera.controls.target.copy(target)

    this.scene.add(this.debugCamera.object)
    this.scene.add(this.mainCamera.object)

    this.camera = this.params.debugCam ? this.debugCamera.object : this.mainCamera.object

    this.context.tweakpane
      .addInput(this.params, 'debugCam', { label: 'Debug Cam' })
      .on('change', ({ value }) => (this.camera = value ? this.debugCamera.object : this.mainCamera.object))

    // this.context.tweakpane.addInput(this.debugCamera.controls, 'enabled', { label: 'Debug Cam' })

    this.setObjects()
  }

  private setObjects() {
    const lightContext = extendContext(this.context, {
      tweakpane: this.context.tweakpane.addFolder({ title: 'Lights', expanded: false }),
    })

    const lightInfos: {
      params: LightParams
      transform: ConstructorParameters<typeof Light>[3]
      lightName: string
    }[] = [
      {
        params: {
          alpha: 0.36,
          highlight: { min: 0.11, max: 0.45 },
          center: { x: 0.5, y: 0.39 },
          sdfStep: { min: -0.51, max: 0.355 },
          capsule: { x: 0.34, y: 0.1, z: 0.25 },
          noiseIntensity: { min: 0, max: 1 },
        },
        transform: {
          position: new THREE.Vector3(-7.7, 0, -10.4),
          rotation: new THREE.Euler(0, 0.3, 0),
          scale: new THREE.Vector3(2.0, 1.9, 1),
        },
        lightName: 'light_1',
      },
      {
        params: {
          alpha: 0.74,
          highlight: { min: 0, max: 1 },
          center: { x: 0.5, y: 0.36 },
          sdfStep: { min: -0.67, max: 0.419 },
          capsule: { x: 0.61, y: 0.15, z: 0.78 },
          noiseIntensity: { min: 0.34, max: 0.81 },
        },
        transform: {
          position: new THREE.Vector3(-9.6, 0.9, -1.5),
          rotation: new THREE.Euler(0, 0.6, 0),
          scale: new THREE.Vector3(2, 1.3, 1.0),
        },
        lightName: 'light_2',
      },
      {
        params: {
          alpha: 0.71,
          center: { x: 0.5, y: 0.41 },
          sdfStep: { min: -0.67, max: 0.2 },
          noiseIntensity: { min: 0.24, max: 0.71 },
        },
        transform: {
          position: new THREE.Vector3(-10.2, 1.6, -13),
          rotation: new THREE.Euler(-0.5, 0.3, 0.5),
          scale: new THREE.Vector3(2.9, 1, 0.4),
        },
        lightName: 'light_3',
      },
      {
        params: {
          sdfStep: { min: -0.61, max: 0.2 },
        },
        transform: {},
        lightName: 'light_4',
      },
    ]

    this.lights = lightInfos.map(
      ({ lightName, params, transform }) => new Light(lightContext, lightName, params, transform)
    )
    this.lights.forEach((light) => this.scene.add(light.object))

    this.dust = new Dust(this.context)
    this.scene.add(this.dust.object)

    this.face = new Face(this.context)
    this.scene.add(this.face.object)

    const ground = new Ground(this.context)
    this.scene.add(ground.object)

    const background = new Background(this.context)
    this.scene.add(background.object)

    const title = new MainTitle(this.context)
    this.scene.add(title.object)
    // this.test = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(), new THREE.MeshBasicMaterial({ color: '#ffffff' }))
    // this.scene.add(this.test)
    // msdf-bmfont --reuse -o ../atlas.png -m 512,256 -s 42 -r 3 -p 1 -t msdf ./ClashDisplay-Bold.ttf
  }

  public tick(time: number, delta: number): void {
    this.face?.tick(time, delta)
    this.debugCamera.tick(time, delta)
    this.mainCamera.tick(time, delta)
    this.dust.tick(time, delta)
    this.lights.forEach((light) => light.tick(time, delta))
    //--
    // this.particles.tick(time, delta)
    // this.testCube.rotateX(0.02)
    // this.testCube.rotateY(0.01)
  }
}
