uniform float uAlpha;
uniform vec3 uColor;
uniform vec2 uCenter;
uniform vec3 uCapsule;
uniform vec2 uSdfStep;
uniform vec2 uHighlight;
uniform vec3 uHighlightColor;
uniform sampler2D uNoise;
uniform vec2 uNoiseScale;
uniform vec2 uNoiseIntensity;
uniform float uTime;
uniform float uSeed;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

#include "/math/remap.glsl";

float sdUnevenCapsule(vec2 p, float r1, float r2, float h) {
  p.x = abs(p.x);
  float b = (r1 - r2) / h;
  float a = sqrt(1.0 - b * b);
  float k = dot(p, vec2(- b, a));
  if (k < 0.0)
    return length(p) - r1;
  if (k > a * h)
    return length(p - vec2(0.0, h)) - r2;
  return dot(p, vec2(a, b)) - r1;
}
float exponentialIn(float t) {
  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

void main() {
  vec3 normal = normalize(vNormal);

  float sdf = sdUnevenCapsule(vUv - uCenter, uCapsule.x, uCapsule.y, uCapsule.z);
  // sdf = step(sdf, 0.);
  sdf = smoothstep(uSdfStep.y, uSdfStep.x, sdf);
  // sdf = exp(sdf);
  sdf = exponentialIn(sdf);
  // sdf *= 0.13;
  // float dist = length(vPosition.xy + uCenter.yx);
  float ax = abs(vUv.x - 0.5);
  float ay = cremap(vUv.y, 0.8, 1., 1., 0.);
  float a = smoothstep(0.5, 0.3, ax) * ay;
  // float alpha = cremap(sdf, 0., 2.5, 0.13, 0.) * a;
  vec2 coords = fract(vPosition.xy * vec2(uNoiseScale.x, uNoiseScale.y) + uTime * 0.05 + uSeed);
  float n = texture2D(uNoise, coords).r;
  n = remap(n, 0., 1., uNoiseIntensity.x, uNoiseIntensity.y);

  float alpha = sdf * a * n;
  // float alpha = sdf;
  float blend = cremap(alpha, uHighlight.x, uHighlight.y, 0., 0.99);

  float d = dot(normal, vec3(0., 0., 1.));
  d = cremap(d, 0.5, 1., 0., 1.);
  d = exponentialIn(d);
  float additionalLight = cremap(d, 0.5, 1., 0., 0.2);
  d = cremap(d, 0., 1., 0.3, 1.);

  gl_FragColor = vec4(mix(uColor, uHighlightColor, blend) + additionalLight, alpha * uAlpha * d);
  // gl_FragColor = vec4(vec3(d), 1.);

  // gl_FragColor = vec4(vec3(blend), 1.);
  // gl_FragColor = vec4(vPosition, 1.);
}
