#include "/math/remap.glsl";

varying vec4 vSeeds;
varying float vAlpha;

const float border_size = 0.01;
const float disc_radius = 0.1;
const float border_size1 = 0.6;
const float disc_radius1 = 0.1;
uniform float uAlpha;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
  vec2 uv = gl_PointCoord.xy;
  uv -= vec2(0.5);
  float dist = sqrt(dot(uv, uv));
  float dr = disc_radius * vSeeds.x;
  float t = smoothstep(dr+border_size, dr-border_size, dist) * 20.;
  float t1 = smoothstep(disc_radius1+border_size1, disc_radius1-border_size1, dist);
  vec3 color = mix(uColor1, uColor2, vSeeds.z);
  float a = vAlpha * (t+t1) * uAlpha;
  a *= .3 + ((sin(((uTime * 1.) + vSeeds.w) * 6.28) + 1.) * .5) * .7;
  a *= .6 + ((sin(((uTime * 2.) + vSeeds.z) * 6.28) + 1.) * .5) * .5;
  color += a;
  gl_FragColor = vec4(color, a);
  // gl_FragColor = vec4(1.);
}
