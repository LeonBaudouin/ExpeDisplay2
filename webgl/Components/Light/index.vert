varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vPosition = cross(position, normal);
  vUv = uv;
  vNormal = normalMatrix * normal;
  vec4 mvPosition =  viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;
}
