import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'

export default class Circle extends AbstractObject {
  constructor(context: WebGLAppContext) {
    super(context)

    this.object = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uTexture: { value: new THREE.TextureLoader().load('1-2.png') },
        },
      })
    )
  }
}
