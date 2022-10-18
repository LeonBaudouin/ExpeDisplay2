// Varyings
varying vec2 vUv;
varying vec4 vBox;
uniform vec2 uSlide;

// Uniforms
#include "/msdf/common_uniforms.glsl";

// Utils
#include "/msdf/median.glsl";

#include "/math/remap.glsl";

float isNorm(vec2 _st) {
  if (_st.x > 1. || _st.y > 1. || _st.x < 0. || _st.y < 0.)
    return 0.;
  return 1.;
}

void main() {
  // // Common
  // Texture sample
  vec2 offset = vBox.zw - vBox.xy;
  vec2 uvs = vUv + uSlide * offset;
  vec2 remapUvs = vec2(cremap(uvs.x, vBox.x, vBox.z, - 0.001, 1.001), cremap(uvs.y, vBox.y, vBox.w, - 0.001, 1.001));
  float is = isNorm(remapUvs);
  vec3 s = texture2D(uMap, uvs).rgb;

  // Signed distance
  float sigDist = median(s.r, s.g, s.b) - 0.5;

  float afwidth = 1.4142135623730951 / 2.0;

  #ifdef IS_SMALL
  float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist) * 0.3 / uThreshold;
  #else
  float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
  #endif
  alpha *= is;

  // Alpha Test
  #include "/msdf/alpha_test.glsl";

  // Outputs
  #include "/msdf/common_output.glsl";
}
