import { WebGLAppContext } from '~~/webgl'
import * as THREE from 'three'
import SimpleCamera from '../SimpleCamera'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import lerp from '~~/utils/math/lerp'

export default class RotationCamera extends SimpleCamera {
  private target = new THREE.Vector3()
  private angle: number
  private distance: number
  private angleOffset = new THREE.Vector2()
  private angleOffsetTarget = new THREE.Vector2()

  constructor(
    context: WebGLAppContext,
    { target, ...transform }: { defaultPosition?: THREE.Vector3; defaultRotation?: THREE.Euler; target: THREE.Vector3 }
  ) {
    super(context, transform)
    this.target.copy(target)

    const pos = new THREE.Vector2(this.target.x - this.object.position.x, this.target.y - this.object.position.z)

    this.angle = pos.angle() - Math.PI
    this.distance = pos.length()

    window.addEventListener('mousemove', ({ clientX, clientY }) => {
      const { x, y } = pixelToScreenCoords(clientX, clientY)
      this.angleOffsetTarget.x = x * 0.07
      this.angleOffsetTarget.y = y * 0.3
    })
  }

  public tick(time: number, delta: number): void {
    this.angleOffset.lerp(this.angleOffsetTarget, 0.03)

    this.object.position.x = this.target.x + Math.cos(this.angle + this.angleOffset.x) * this.distance
    this.object.position.z = this.target.y + Math.sin(this.angle + this.angleOffset.x) * this.distance
    this.object.position.y = this.angleOffset.y
    this.object.lookAt(this.target)
  }
}
