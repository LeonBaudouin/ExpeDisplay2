import bezier from 'bezier-easing'
import gsap from 'gsap'
import * as THREE from 'three'
import addNoiseInput from '~~/utils/tweakpane/addNoiseInput'
import { noiseWatch, textureWatch } from '~~/utils/uniforms/customWatcher'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import copyMatrix from '~~/utils/webgl/copyMatrix'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { extendContext } from '~~/webgl/abstract/Context'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'
import proxyFragment from './proxy.frag'
import proxyVertex from './proxy.vert'

export type FaceData = ReturnType<typeof Face['DEFAULT_PARAMS']>
export type FaceParams = Partial<FaceData>

export default class Face extends AbstractObject<MainSceneContext> {
  private face: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  private mouseTarget = new THREE.Vector3()
  private mouse = new THREE.Vector3()
  private sphereProxy: THREE.Object3D
  private faceProxy: THREE.Object3D
  public sun: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  private flippedSun: boolean

  public static DEFAULT_PARAMS = () =>
    reactive({
      // matcap: `${location.origin}/matcap.png`,
      shineColor: '#ffd39a',
      matcap: `${location.origin}/36220C_C6C391_8C844A_8B7B4C.jpg`,
      sdf: { x: -3.3, y: 3.35, z: 0.5, w: 7 },
      debug: false,
      noise: { size: { x: 512, y: 512 }, noiseScale: 4, octave: 2 },
      useMouse: 0,
      fadeSun: true,
      // matcap: 'https://github.com/nidorx/matcaps/blob/master/thumbnail/36220C_C6C391_8C844A_8B7B4C.jpg',
    })

  public data: FaceData

  constructor(
    context: MainSceneContext,
    params: FaceParams,
    { mesh, proxy, flippedSun }: { mesh: THREE.Mesh; proxy: THREE.Mesh; flippedSun: boolean }
  ) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Face', expanded: false }) }))

    Object.assign(params, { ...Face.DEFAULT_PARAMS(), ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as FaceData

    const proxyGeom = proxy.geometry
    this.flippedSun = flippedSun

    this.object = new THREE.Object3D()
    copyMatrix(proxy, this.object)
    this.setupSun(proxyGeom)
    this.setupFace(mesh.geometry)

    this.sphereProxy = this.context.ressources.gltf.scene?.scene.getObjectByName('sphere_proxy') as THREE.Object3D
    this.faceProxy = new THREE.Mesh(proxyGeom)
    this.faceProxy.visible = false
    this.object.add(this.faceProxy)

    this.setupHelper()
    this.setupGui()

    this.setupMouseInteraction()
  }

  private setupSun(geom: THREE.BufferGeometry) {
    this.sun = new THREE.Mesh(
      geom,
      new THREE.ShaderMaterial({
        fragmentShader: proxyFragment,
        vertexShader: proxyVertex,
        side: this.flippedSun ? THREE.BackSide : THREE.FrontSide,
        uniforms: {
          uShineColor: { value: new THREE.Color() },
          uSdf: { value: new THREE.Vector4() },
          uNoise: { value: null },
          uFadeSun: { value: false },
        },
      })
    )
    this.sun.scale.setScalar(0.99)
    reactiveUniforms(this.sun.material.uniforms, this.data, {
      noise: noiseWatch(this.context, 'faceFadeNoise'),
    })
    this.object.add(this.sun)
  }

  private setupFace(geom: THREE.BufferGeometry) {
    this.face = new THREE.Mesh(
      geom,
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uTime: { value: 0 },
          uMatcap: { value: null },
          uSdf: { value: new THREE.Vector4() },
          uNoise: { value: null },
          uMouse: { value: new THREE.Vector3() },
          uUseMouse: { value: 0 },
        },
      })
    )
    reactiveUniforms(this.face.material.uniforms, this.data, {
      matcap: textureWatch,
      noise: noiseWatch(this.context, 'faceFadeNoise'),
    })
    this.object.add(this.face)
  }

  private setupMouseInteraction() {
    const raycaster = new THREE.Raycaster()

    const mat = new THREE.Matrix4()
    const tempVec1 = new THREE.Vector3()

    const sphere = new THREE.Sphere(this.sphereProxy.position, this.sphereProxy.scale.x)
    window.addEventListener('mousemove', (e) => {
      raycaster.setFromCamera(pixelToScreenCoords(e.clientX, e.clientY), this.context.scene.camera)
      const [intersection] = raycaster.intersectObject(this.faceProxy)
      if (intersection) {
        mat.copy(this.object.matrix).invert()
        intersection.point.applyMatrix4(mat)
        this.mouseTarget.copy(intersection.point)
        return
      }
      raycaster.ray.intersectSphere(sphere, tempVec1)
      mat.copy(this.object.matrix).invert()
      tempVec1.applyMatrix4(mat)
      this.mouseTarget.copy(tempVec1)
    })

    // window.addEventListener('click', (e) => {
    //   raycaster.setFromCamera(pixelToScreenCoords(e.clientX, e.clientY), this.context.scene.camera)
    //   const [intersection] = raycaster.intersectObject(this.faceProxy)
    //   if (intersection) this.animClick(intersection.point)
    // })
  }

  // public animClick(p: THREE.Vector3) {
  //   this.data.sdf.x = p.x
  //   this.data.sdf.y = p.y
  //   this.data.sdf.z = p.z
  //   gsap.to(this.data, { useMouse: 0, duration: 0.3 })
  //   gsap.to(this.data.sdf, { w: 4, duration: 1.4, ease: 'Power2.easeOut' })
  // }

  private setupGui() {
    this.context.tweakpane.addInput(this.data, 'shineColor', { label: 'Shine Color' })
    this.context.tweakpane.addInput(this.data, 'matcap', {
      label: 'Matcap',
      view: 'input-image',
      imageFit: 'contain',
    })
    this.context.tweakpane.addInput(this.data, 'sdf', { label: 'Distance Field' })
    this.context.tweakpane.addInput(this.data, 'useMouse', { label: 'Use Mouse', min: 0, max: 1 })
    this.context.tweakpane.addInput(this.data, 'debug', { label: 'Debug Field' })
    this.context.tweakpane.addInput(this.data, 'fadeSun', { label: 'Fade Sun' })
    addNoiseInput(this.context, this.data, 'noise', { title: 'Noise', expanded: false })
  }

  private setupHelper() {
    const helper = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(1, 2),
      new THREE.MeshBasicMaterial({ color: 'black', fog: false, wireframe: true })
    )
    this.context.scene.scene.add(helper)
    watchEffect(() => {
      helper.position.set(this.data.sdf.x, this.data.sdf.y, this.data.sdf.z)
      helper.scale.setScalar(this.data.sdf.w)
      helper.visible = this.data.debug
    })
  }

  public tick(time: number, delta: number): void {
    this.face.material.uniforms.uTime.value = time
    this.mouse.lerp(this.mouseTarget, 0.2)
    this.face.material.uniforms.uMouse.value.lerp(this.mouseTarget, 0.2)
  }
}
