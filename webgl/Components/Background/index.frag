varying vec3 vEye;
uniform vec3 fogColor;
uniform vec3 uColor;

#include "/math/remap.glsl";

void main() {
  vec3 direction = vec3(-1, 0., -0.5);
  float d = dot(vEye, normalize(direction));
  d = cremap(d, 0.9, 1., 0., 1.);
  float d2 = dot(vEye, vec3(0., 1., 0.));
  d2 = cremap(d2, 0., 1., 0., 1.);
  d *= d2;
  float d3 = dot(vEye, normalize(vec3(0.2, 0., -0.5)));
  d3 = cremap(d3, 0.9, 1., 0., 1.);
  vec3 color = mix(fogColor, uColor, d);
  color = mix(color, vec3(0), d3 * d2 * 4.);
  gl_FragColor = vec4(color, 1.);
  // gl_FragColor = vec4(vec3(d2), 1.);
}
