vec2 scaleUvs(vec2 st, vec2 scale, vec2 center) {
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, vec2 scale, float center) {
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, float scale, vec2 center) {
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, float scale, float center) {
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, float scale) {
  float center = 0.5;
  return (st - center) * scale + center;
}
vec2 scaleUvs(vec2 st, vec2 scale) {
  float center = 0.5;
  return (st - center) * scale + center;
}
