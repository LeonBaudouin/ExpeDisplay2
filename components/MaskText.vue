<template>
  <span
    v-for="(char, i) in characters"
    class="char"
    :class="{ 'char--show': show }"
    :style="{ '--delay': `${delay + i * stagger}ms`, '--direction': directionVar }"
  >
    <span class="char__placeholder">{{ char == ' ' ? '&nbsp;' : char }}</span>
    <span class="char__letter">{{ char == ' ' ? '&nbsp;' : char }}</span>
  </span>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

const { text, show, direction } = defineProps({
  text: { type: String, required: true },
  direction: { type: Object as PropType<{ x: number; y: number }>, default: { x: 0, y: 1 } },
  show: { type: Boolean, default: true },
  stagger: { type: Number, default: 10 },
  delay: { type: Number, default: 0 },
})

const characters = computed(() => text.split(''))
const directionVar = computed(() => `${direction.x * -100}%, ${direction.y * -100}%, 0`)
</script>

<style lang="scss">
.char {
  display: inline-block;
  position: relative;
  overflow: hidden;

  &__placeholder {
    visibility: hidden;
  }

  &__letter {
    position: absolute;
    left: 0;
    transform: translate3d(var(--direction));
    opacity: 0;
    transition: transform 0.8s cubic-bezier(0, 0.34, 0, 1) var(--delay, 0s), opacity 0.8s ease-out var(--delay, 0s);
  }

  &--show &__letter {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}
</style>
