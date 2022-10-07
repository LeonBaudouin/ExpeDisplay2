varying vec3 vWorldPosition;
varying vec2 vUv;
uniform vec3 uColor;
uniform vec3 uShadowColor;
uniform float uShadowDensity;
uniform vec3 fogColor;
uniform float fogDensity;

#include "/math/random.glsl"

void main() {
  float depth = length(vWorldPosition);
  float shadowDepth = length(vWorldPosition - vec3(-0.5, 0., 1.));
  float fogFactor = 1.0 - exp(- fogDensity * fogDensity * depth * depth);
  gl_FragColor = vec4(mix(uColor, fogColor, fogFactor), 1.);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, uShadowColor, exp(- uShadowDensity * uShadowDensity * shadowDepth * shadowDepth) * 2.);
  gl_FragColor += random(gl_FragCoord.xy) * 0.05 * (exp(- (fogDensity * 0.8) * (fogDensity * 0.8) * depth * depth));

}
