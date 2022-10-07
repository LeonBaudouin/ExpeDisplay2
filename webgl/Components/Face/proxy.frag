uniform vec3 uShineColor;
varying float vAlpha;

void main() {
  gl_FragColor = vec4(uShineColor, vAlpha);
  if (gl_FragColor.a < 0.5)
    discard;
}
