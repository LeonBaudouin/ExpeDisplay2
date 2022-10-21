varying float vAlpha;
uniform bool uFadeSun;
uniform vec4 uSdf;
uniform sampler2D uNoise;

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

void main() {
  vec3 noise = texture2D(uNoise, uv).rgb;
  float n = (noise.r - 0.5) * 2.;

  vec3 worldCenter = (modelMatrix * vec4(position, 1.)).xyz;
  if(uFadeSun)
    vAlpha = smoothstep(0., 0.5, sdSphere(uSdf.xyz - worldCenter, uSdf.w + n + 0.1));
  else
    vAlpha = 1.;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
