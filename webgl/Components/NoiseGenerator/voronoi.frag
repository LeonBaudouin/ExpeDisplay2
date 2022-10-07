// https://thebookofshaders.com/12/?lan=fr
varying vec2 vUv;
uniform float uNoiseScale;

vec2 random2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

void main() {
  vec2 st = vUv;

    // Scale
  st *= uNoiseScale;

    // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = 10.;  // minimum distance
  vec2 m_point;        // minimum point

  for (int j = - 1; j <= 1; j ++) {
    for (int i = - 1; i <= 1; i ++) {
      vec2 neighbor = vec2(float(i), float(j));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);

      if (dist < m_dist) {
        m_dist = dist;
        m_point = point;
      }
    }
  }

  vec3 color = vec3(0.);
  // vec3 color = vec3(m_dist);
  color.rg = m_point;
  // color.b = dot(m_point, vec2(.3, .6));

  gl_FragColor = vec4(color, 1.0);
}
