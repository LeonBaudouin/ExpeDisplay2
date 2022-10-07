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

export default class Face extends AbstractObject<MainSceneContext> {
  private face: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  private mouseTarget = new THREE.Vector3()
  private mouse = new THREE.Vector3()
  public sun: THREE.Mesh

  private params = reactive({
    // matcap: `${location.origin}/matcap.png`,
    shineColor: '#ffd39a',
    matcap: `${location.origin}/36220C_C6C391_8C844A_8B7B4C.jpg`,
    sdf: { x: -3.3, y: 3.35, z: 0.5, w: 7 },
    debug: false,
    noise: { size: { x: 512, y: 512 }, noiseScale: 4, octave: 2 },
    useMouse: 0,
    // matcap: 'https://github.com/nidorx/matcaps/blob/master/thumbnail/36220C_C6C391_8C844A_8B7B4C.jpg',
  })

  constructor(context: MainSceneContext) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Face', expanded: false }) }))

    const proxyMesh = this.context.ressources.gltf.scene?.scene.getObjectByName('proxy') as THREE.Mesh
    const proxy2 = this.context.ressources.gltf.scene?.scene.getObjectByName('proxy_2') as THREE.Object3D
    const proxyGeom = proxyMesh.geometry
    const mesh = this.context.ressources.gltf.face?.scene.children[0] as THREE.Mesh
    const sun = new THREE.Mesh(
      proxyGeom,
      new THREE.ShaderMaterial({
        fragmentShader: proxyFragment,
        vertexShader: proxyVertex,
        side: THREE.BackSide,
        uniforms: {
          uShineColor: { value: new THREE.Color() },
          uSdf: { value: new THREE.Vector4() },
          uNoise: { value: null },
        },
      })
    )
    reactiveUniforms(sun.material.uniforms, this.params, {
      noise: noiseWatch(this.context, 'faceFadeNoise'),
    })

    this.context.tweakpane.addInput(this.params, 'shineColor', { label: 'Shine Color' })

    sun.scale.setScalar(0.99)
    const faceProxy = new THREE.Mesh(proxyGeom)
    faceProxy.visible = false
    this.sun = sun

    this.object = new THREE.Object3D()
    copyMatrix(proxyMesh, this.object)
    this.face = new THREE.Mesh(
      mesh.geometry,
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

    reactiveUniforms(this.face.material.uniforms, this.params, {
      matcap: textureWatch,
      noise: noiseWatch(this.context, 'faceFadeNoise'),
    })

    this.context.tweakpane.addInput(this.params, 'matcap', {
      label: 'Matcap',
      view: 'input-image',
      imageFit: 'contain',
    })
    this.context.tweakpane.addInput(this.params, 'sdf', { label: 'Distance Field' })
    this.context.tweakpane.addInput(this.params, 'debug', { label: 'Debug Field' })
    const easing = bezier(0.12, 0, 0.15, 1)
    const animIntro = () => {
      const tl = gsap.timeline()
      tl.set(this.params, { useMouse: 0 })
      tl.fromTo(
        this.params.sdf,
        { w: 7.5, x: -5, y: 2 },
        {
          w: 0,
          x: 1.8,
          y: 3.35,
          duration: 2.5,
          ease: easing,
        }
      )
      tl.to(this.params, {
        useMouse: 1,
        duration: 1,
        delay: -0.8,
      })
    }
    watch(
      () => this.context.state.isReady,
      (isReady) => {
        if (!isReady) return
        animIntro()
      },
      { immediate: true }
    )

    this.context.tweakpane.addButton({ title: 'Anim' }).on('click', animIntro)

    addNoiseInput(this.context, this.params, 'noise', { title: 'Noise', expanded: false })

    const helper = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(1, 2),
      new THREE.MeshBasicMaterial({ color: 'black', fog: false, wireframe: true })
    )
    this.context.scene.scene.add(helper)
    watchEffect(() => {
      helper.position.set(this.params.sdf.x, this.params.sdf.y, this.params.sdf.z)
      helper.scale.setScalar(this.params.sdf.w)
      helper.visible = this.params.debug
    })

    this.object.add(this.face)
    this.object.add(this.sun)
    this.object.add(faceProxy)

    const raycaster = new THREE.Raycaster()

    const mat = new THREE.Matrix4()
    const tempVec1 = new THREE.Vector3()

    const sphere = new THREE.Sphere(proxy2.position, proxy2.scale.x)
    window.addEventListener('mousemove', (e) => {
      raycaster.setFromCamera(pixelToScreenCoords(e.clientX, e.clientY), this.context.scene.camera)
      const [intersection] = raycaster.intersectObject(faceProxy)
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
  }

  public tick(time: number, delta: number): void {
    this.face.material.uniforms.uTime.value = time
    this.mouse.lerp(this.mouseTarget, 0.2)
    this.face.material.uniforms.uMouse.value.lerp(this.mouseTarget, 0.2)
  }
}
