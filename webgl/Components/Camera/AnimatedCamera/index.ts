import gsap from 'gsap'
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'

export default class AnimatedCamera extends AbstractObject {
  private mixer: THREE.AnimationMixer
  public camera: THREE.PerspectiveCamera
  private action: THREE.AnimationAction
  private clip: THREE.AnimationClip

  private get animationIsFinished(): boolean {
    return this.clip.duration === this.action.time
  }
  private get objectToOffset(): THREE.Object3D {
    return this.animationIsFinished ? this.camera : this.proxy
  }

  private target = new THREE.Vector3()
  private angleOffset = new THREE.Vector2()
  private angleOffsetTarget = new THREE.Vector2()
  private proxy = new THREE.Object3D()
  private lerpValue = 0
  private offset = 0

  constructor(context: WebGLAppContext, gltf: GLTF, { target }: { target: THREE.Vector3 }) {
    super(context)
    this.target.copy(target)
    this.object = gltf.scene.getObjectByName('anim_camera')!
    this.clip = gltf.animations[0]!
    this.camera = this.object.children[0] as THREE.PerspectiveCamera
    this.proxy.add(this.camera)
    this.object.add(this.proxy)

    // const helper2 = new THREE.AxesHelper(1)
    // this.proxy.add(helper2)

    // this.context.tweakpane.addInput(this.camera, 'position')
    this.mixer = new THREE.AnimationMixer(this.object)
    this.action = this.mixer.clipAction(this.clip)
    this.action.clampWhenFinished = true
    this.action.loop = THREE.LoopOnce
    // const helper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), 5)
    // this.camera.add(helper)

    window.addEventListener('resize', this.onResize)
    window.addEventListener('mousemove', this.onMouseMove)
    this.mixer.addEventListener('finished', this.onFinished)

    this.onResize()
  }

  public animate = () => {
    this.action.play()
  }

  private onFinished = () => {
    const previousOffset = this.proxy.position.x
    this.proxy.position.copy(this.target)
    this.object.worldToLocal(this.proxy.position)
    this.object.localToWorld(this.camera.position)
    this.proxy.updateMatrixWorld()
    this.proxy.worldToLocal(this.camera.position)
    this.camera.position.x = previousOffset
    gsap.to(this, { lerpValue: 0.03, duration: 0.7, ease: 'Power2.easeInOut' })
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.objectToOffset.position.x = -2.21 * this.camera.aspect + 3.04
  }

  private onMouseMove = ({ clientX, clientY }: MouseEvent) => {
    const { x, y } = pixelToScreenCoords(clientX, clientY)
    this.angleOffsetTarget.x = x * 0.07
    this.angleOffsetTarget.y = y * 0.03
  }

  private rotate() {
    this.angleOffset.lerp(this.angleOffsetTarget, this.lerpValue)
    this.proxy.rotation.z = this.angleOffset.x
    this.proxy.rotation.x = this.angleOffset.y
  }

  public tick(time: number, delta: number): void {
    this.mixer.update(delta)
    if (this.animationIsFinished) this.rotate()
  }
}
