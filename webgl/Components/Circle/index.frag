varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
  float circle = length(vUv - vec2(0.5));
  float alpha = step(circle, 0.5);
  if (alpha < 0.5) discard;
  gl_FragColor = texture2D(uTexture, vUv);
}
