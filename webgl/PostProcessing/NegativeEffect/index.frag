uniform sampler2D uTexture;
uniform vec3 uBackgroundColor;
uniform float uFade;
uniform float uLuminosity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec4 negativeLayer = texture(uTexture, uv);
  vec3 color = mix(inputColor.rgb, 1. - inputColor.rgb, negativeLayer.r);
  // vec3 color = mix(inputColor.rgb, 1. - inputColor.rgb, 1.);
  // color = mix(color, vec3(1.), uLuminosity);
  color = mix(color, uBackgroundColor, uFade);
  outputColor = vec4(color, inputColor.a);
}
