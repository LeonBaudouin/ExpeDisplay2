uniform sampler2D uTexture;
uniform vec3 uBackgroundColor;
uniform float uFade;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec4 negativeLayer = texture(uTexture, uv);
  vec3 color = mix(inputColor.rgb, 1. - inputColor.rgb, negativeLayer.r);
  color = mix(color, uBackgroundColor, uFade);
  outputColor = vec4(color, inputColor.a);
}
