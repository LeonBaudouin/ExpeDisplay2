attribute vec3 _center;
attribute vec3 _torque;
varying vec3 vCenter;
varying vec3 vNormal;
varying vec3 vRealNormal;
varying vec3 vViewPosition;
varying vec3 vLightDirection;
uniform sampler2D uNoise;
uniform float uUseMouse;

uniform float uTime;
uniform vec3 uMouse;
uniform vec4 uSdf;

#include "/math/remap.glsl";

mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

void main() {

  vec3 noise = texture2D(uNoise, uv).rgb;
  float n = (noise.r - 0.5) * 2.;

  vec3 worldCenter = (modelMatrix * vec4(_center, 1.)).xyz;
  // trade*
  float appear = clamp(sdSphere(uSdf.xyz - worldCenter, uSdf.w + n), 0., 1.);

  vec3 target = mix(uSdf.xyz, uMouse, uUseMouse);
  vec3 dirVector = normalize(target - _center);
  vec3 axis = cross(dirVector, _torque);
  float dist = length(uMouse - _center);
  dist = smoothstep(1.2, 0.5, dist) * 0.5;
  float angle = mix((1. - appear) * 3.14, dist, uUseMouse);
  mat4 rotation = rotation3d(axis, angle);

  vec4 transformedPosition = vec4(position, 1.0);
  transformedPosition.xyz -= _center;
  transformedPosition = rotation * transformedPosition;
  transformedPosition.xyz *= mix(cubicOut(appear), 1., uUseMouse);
  transformedPosition.xyz += _center;

  vLightDirection = normalize(- transformedPosition.xyz);

  vec4 mvPosition = modelViewMatrix * transformedPosition;
  gl_Position = projectionMatrix * mvPosition;

  vCenter = _center;
  vRealNormal = (rotation * vec4(normal, 1.)).xyz;
  vNormal = (rotation * vec4(normalMatrix * normal, 1.)).xyz;

  vViewPosition = - mvPosition.xyz;
}
