attribute float aIndex;
uniform float uTime;
varying vec4 vSeeds;
varying float vAlpha;

#define PI 3.14159

#include "/math/random.glsl";
#include "/math/remap.glsl";

void main() {
  float life = fract(uTime / 100. + random(aIndex + 1.));

  vSeeds = vec4(random(aIndex + 0.1), random(aIndex + 0.2), random(aIndex + 0.3), random(aIndex + 0.4));

  float angle = vSeeds.x * PI * 2.;
  float amplitude = remap(fract(vSeeds.y), 0., 1., 3., 15.);
  float height = remap(fract(vSeeds.z + uTime * 0.2), 0., 1., 4., -3.);

  vec3 startPos = vec3(cos(angle), 0., sin(angle)) * amplitude;
  startPos.y = height;

  vec3 offset = startPos;
  vec4 mvPosition = modelViewMatrix * vec4((position + offset), 1.0);
  float dist = length(mvPosition);
  gl_Position = projectionMatrix * mvPosition;

  vAlpha = cremap(offset.y, -2.5, -3., 1., 0.);

  float uSize = 100.;
  gl_PointSize = uSize;
  gl_PointSize *= (1.0 / - mvPosition.z);
}
