float s(float x) {
  return (cos((x) * PI) / 2.) + 0.5;
}

vec3 factors(float x) {
  float r = 1. - mod(floor(x * 0.5), 3.);
  float g = 1. - mod(floor(x * 0.5 + 1.), 3.);
  float b = 1. - mod(floor(x * 0.5 + 2.), 3.);
  return max(vec3(r, g, b), 0.);
}

vec3 colorRotation(float x) {
  vec3 color = vec3(0.);
  float sinA = s(x);
  float sinB = s(x + 1.);
  color += vec3(sinA) * factors(x + 3.);
  color += vec3(sinB) * factors(x);
  return color;
}
