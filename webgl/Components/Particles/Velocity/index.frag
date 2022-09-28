varying vec2 vUv;
uniform sampler2D uFbo;
uniform sampler2D uPositionFbo;

void main() {
  vec4 positionData = texture2D(uPositionFbo, vUv);
  vec4 inputData = texture2D(uFbo, vUv);

	gl_FragColor = inputData;
}
