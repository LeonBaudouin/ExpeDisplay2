varying vec3 vCenter;
varying vec3 vNormal;
varying vec3 vViewPosition;
uniform sampler2D uMatcap;
uniform float uBloom;
varying vec3 vLightDirection;
varying vec3 vRealNormal;

vec3 packNormalToRGB(const in vec3 normal) {
  return normalize(normal) * 0.5 + 0.5;
}

void main() {
  vec3 normal = normalize(vNormal);
  gl_FragColor = vec4(vCenter, 1.);
  gl_FragColor = vec4(packNormalToRGB(vNormal), 1.);

  vec3 viewDir = normalize(vViewPosition);
  vec3 x = normalize(vec3(viewDir.z, 0.0, - viewDir.x));
  vec3 y = cross(viewDir, x);
  vec2 matcapUv = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5;
  vec4 texel = texture2D(uMatcap, matcapUv);
  vec4 bloomColor = vec4(vec3(0.), 1.);
  gl_FragColor = mix(texel, bloomColor, uBloom);
  gl_FragColor.rgb += smoothstep(0., 0.9, dot(vRealNormal, vLightDirection));
  // gl_FragColor = vec4(1.);
}
