<template>
  <div>
    <div class="home">
      <h1 class="home__title" ref="title">Experiments</h1>
      <h2 class="home__subtitle" ref="subtitle">Some ideas that popped into my head</h2>
    </div>
    <div class="name" :class="{ 'name--show': show }">Léon Baudouin</div>
  </div>
</template>

<script setup lang="ts">
const title = useTextRect('title')
const subtitle = useTextRect('subtitle')

const { $webgl } = useNuxtApp()
const show = computed(() => $webgl?.state.isReady)
</script>

<style lang="scss" scoped>
.home {
  color: white;
  position: absolute;
  top: 50vh;
  transform: translateY(-50%);
  margin-left: 3.5vw;
  &__title {
    font-family: var(--titleFont);
    font-weight: 800;
    text-transform: uppercase;
    margin: 0;
    line-height: 0.8;
    font-size: 7.5vw;
    visibility: hidden;
  }
  &__subtitle {
    font-family: var(--bodyFont);
    font-weight: 200;
    margin: 0;
    line-height: 0.8;
    text-align: center;
    font-size: 1.75vw;
    visibility: hidden;
  }
}

.name {
  position: absolute;
  bottom: 40px;
  left: 50vw;
  transform: translateX(-50%);
  font-weight: 400;
  color: #d0e1f3;
  opacity: 0;
  transition: opacity 0.5s 4.2s;

  &--show {
    opacity: 1;
  }
}
</style>
