import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
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
import AnimatedCamera from '~~/webgl/Components/Camera/AnimatedCamera'
import bezier from 'bezier-easing'
import gsap from 'gsap'

export type MainSceneContext = WebGLAppContext & { scene: MainScene }

export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private debugCamera: DebugCamera
  public mainCamera: AnimatedCamera

  private lights: Light[]
  private dust: Dust
  public face?: Face

  protected declare context: MainSceneContext

  private params = {
    debugCam: false,
  }

  constructor(context: WebGLAppContext) {
    super(extendContext(context, { scene: () => this }))

    this.scene = new THREE.Scene()
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

    const target = this.context.ressources.gltf.scene?.cameras
      .find((o) => o.name === 'target_Orientation')!
      .getWorldPosition(new THREE.Vector3())!

    this.debugCamera = new DebugCamera(this.context, {
      defaultPosition: new THREE.Vector3(0, 0, 15),
      defaultRotation: new THREE.Euler(),
    })
    this.mainCamera = new AnimatedCamera(this.context, this.context.ressources.gltf.scene!, {
      target: target,
    })

    this.scene.add(this.debugCamera.object)
    this.scene.add(this.mainCamera.object)

    this.camera = this.params.debugCam ? this.debugCamera.object : this.mainCamera.camera

    this.context.tweakpane
      .addInput(this.params, 'debugCam', { label: 'Debug Cam', index: 0 })
      .on('change', ({ value }) => (this.camera = value ? this.debugCamera.object : this.mainCamera.camera))

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

    this.face = new Face(
      this.context,
      {},
      {
        mesh: this.context.ressources.gltf.face?.scene.children[0] as THREE.Mesh,
        proxy: this.context.ressources.gltf.scene?.scene.getObjectByName('face_proxy') as THREE.Mesh,
        flippedSun: true,
      }
    )
    this.face.object.visible = false
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

  public animFace = () => {
    const data = this.face!.data
    const easing = bezier(0.12, 0, 0.15, 1)

    const tl = gsap.timeline()
    tl.call(() => void (this.face!.object.visible = true))
    tl.set(data, { useMouse: 0 })
    tl.fromTo(
      data.sdf,
      { w: 7.5, x: -5, y: 2 },
      {
        w: 0,
        x: 1.8,
        y: 3.35,
        duration: 2.5,
        ease: easing,
      }
    )
    tl.to(data, {
      useMouse: 1,
      duration: 1,
      delay: -0.8,
    })
    return tl
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
