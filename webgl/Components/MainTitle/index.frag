uniform sampler2D uTexture;
uniform vec2 uProgress;
uniform vec2 uAnimationOffset;
uniform vec2 uRatios;
varying vec2 vUv;

#include "/math/remap.glsl";

float cubicIn(float t) {
  return t * t * t;
}

vec2 scaleUvs(vec2 st, vec2 scale, vec2 center) {
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, vec2 scale, float center) {
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, float scale, vec2 center) {
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, float scale, float center) {
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, float scale) {
  float center = 0.5;
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, vec2 scale) {
  float center = 0.5;
  return (st - center) * scale + center;
}

void main() {
  float zone = texture2D(uTexture, vUv).r;
  float scale = uRatios.y / uRatios.x;
  float center = (uProgress.y * 0.5) + 0.5;
  vec2 uv = scaleUvs(vUv, vec2(1., scale), center);
  float progress = cremap(uProgress.x, 1., 0., -uAnimationOffset.x, 1. + uAnimationOffset.y);
  float individualProg = cremap(progress, zone - uAnimationOffset.x, zone + uAnimationOffset.y, 0., 1.);
  float alpha = cremap(individualProg, 1., 0.3, 0., 1.);
  float offset = cubicIn(individualProg);
  // uv.y += 0.05 + offset;
  uv.x += offset * 0.2;
  uv.y += 0.05;
  vec4 texel = texture2D(uTexture, uv);
  float newZone = texel.r;
  float a = texel.g;
  a *= alpha;
  a *= newZone != zone ? 0. : 1.;
  if (a < 0.1)
    discard;
  gl_FragColor = vec4(vec3(1.), a);
  // gl_FragColor = vec4(vec3(offset), 1.);
}
