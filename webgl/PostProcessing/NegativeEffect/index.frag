uniform sampler2D uNoise;
uniform sampler2D uTexture;
uniform vec2 uProgress;
uniform vec2 uAnimationOffset;
uniform vec2 uRatios;

#include "/math/remap.glsl";
#include "/uv/scaleUvs.glsl";

float cubicIn(float t) {
  return t * t * t;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float zone = texture(uTexture, uv).r;
  float scale = uRatios.y / uRatios.x;
  float center = (uProgress.y * 0.5) + 0.5;
  vec2 st = scaleUvs(uv, vec2(1., scale), center);
  // float progress = cremap(uProgress.x, 1., 0., - uAnimationOffset.x, 1. + uAnimationOffset.y);
  float progress = cremap(uProgress.x, 1., 0., 0., 1.);
  // float individualProg = cremap(progress, zone - uAnimationOffset.x, zone + uAnimationOffset.y, 0., 1.);
  float individualProg = cremap(progress, 0., 1., 0., 1.);
  float alpha = cremap(individualProg, 1., 0.3, 0., 1.);
  float offset = cubicIn(individualProg);
  st.x += offset * 0.05;
  st.y += 0.05;
  vec4 texel = texture(uTexture, st);
  float newZone = texel.r;
  float a = texel.g;
  a *= alpha;
  a *= newZone != zone ? 0. : 1.;

  vec3 color = mix(inputColor.rgb, 1. - inputColor.rgb, a);
  outputColor = vec4(color, inputColor.a);
}

// void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
//   vec2 noiseUvs = scaleUvs(uv, vec2(1., 1. / uRatios.x));
//   vec3 zone = texture(uNoise, noiseUvs).rgb;

//   float scale = uRatios.y / uRatios.x;
//   vec2 b = scaleUvs(zone.xy, vec2(1., scale), 1.);
//   vec2 st = scaleUvs(uv, vec2(1., scale), 1.);
//   st.y += 0.05;
//   st = scaleUvs(st, zone.xy);
//   vec4 texel = texture(uTexture, st);
//   float a = texel.g;
//   // a *= alpha;
//   a *= b.x < 1. && b.y < 1. ? 0. : 1.;

//   vec3 color = mix(inputColor.rgb, 1. - inputColor.rgb, a);
//   outputColor = vec4(color, inputColor.a);
//   outputColor.rgb = zone;
//   // outputColor = vec4(vec3(zone), inputColor.a);
// }
