// Attribute
#include "/msdf/attributes.glsl";

// Varyings
#include "/msdf/varyings.glsl";
attribute vec4 box;

varying float vIndex;
varying vec4 vBox;

void main() {
  #include "/msdf/vertex.glsl";
  vBox = box;
  vIndex = lineLetterIndex / lineLettersTotal;
}
