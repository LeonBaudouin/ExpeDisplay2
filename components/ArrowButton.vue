<template>
  <svg
    class="button"
    :class="{ 'button--hover': hover }"
    width="46"
    height="46"
    viewBox="0 0 46 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle class="button__content" cx="23" cy="23" r="22.5" />
    <g class="button__arrow button__arrow--first">
      <line class="button__content" x1="11.8965" y1="23.2932" x2="34.8965" y2="23.2932" />
      <path class="button__content" d="M28.9483 29.7414L35.2931 23.3966L28.9483 17.0518" />
    </g>
    <g class="button__arrow button__arrow--second">
      <line class="button__content" x1="11.8965" y1="23.2932" x2="34.8965" y2="23.2932" />
      <path class="button__content" d="M28.9483 29.7414L35.2931 23.3966L28.9483 17.0518" />
    </g>
  </svg>
</template>

<script setup lang="ts">
const { hover } = defineProps({
  hover: {
    type: Boolean,
    default: false,
  },
})
</script>

<style lang="scss">
.button {
  --innerButtonColor: var(--buttonColor, #ffffff);

  &__content {
    stroke: var(--innerButtonColor);
  }

  &__arrow {
    &--first {
      transform: translate3d(-46px, 0, 0);
    }
    &--second {
      transform: translate3d(0, 0, 0);
    }
  }

  &--hover & {
    &__arrow {
      transition: transform 0.4s ease;
      &--first {
        transform: translate3d(0, 0, 0);
      }
      &--second {
        transform: translate3d(46px, 0, 0);
      }
    }
  }
}
</style>
