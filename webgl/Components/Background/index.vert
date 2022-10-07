varying vec3 vEye;

#include "/eyeDirection.glsl";

void main() {
  gl_Position = vec4(position, 1.);
  vEye = eyeDirection().xyz;
}
