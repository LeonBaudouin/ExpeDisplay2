<template>
  <div class="home">
    <div class="home__top">
      <div class="title__wrapper">
        <FitText>
          <h1 class="top__title">Experiments</h1>
        </FitText>
      </div>
      <h2 class="top__subtitle"><MaskText text="Some ideas that popped into my head" :show="showSubtitle" /></h2>
    </div>
    <div class="home__bottom">
      <NuxtLink class="bottom__link link" to="#" @mouseenter="hover = true" @mouseleave="hover = false">
        <ArrowButton class="link__arrow" :hover="hover" />
        <span class="link__text">
          <MaskText text="Dive in" :show="showSubtitle" :direction="{ x: 1, y: 0 }" :stagger="0" />
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $webgl } = useNuxtApp()
const hover = ref(false)
const showSubtitle = ref(false)

onMounted(() => {
  watch(
    () => $webgl.state.isReady,
    (isReady) => {
      if (!isReady) return
      setTimeout(() => {
        showSubtitle.value = true
      }, 3000)
    }
  )
})
</script>

<style lang="scss" scoped>
.home {
  &__bottom {
    position: absolute;
    bottom: var(--marginBottom);
  }
}
.title__wrapper {
  margin: 0 -8px;
  visibility: hidden;
}
.top {
  &__title {
    margin: 0;
    font-family: var(--titleFont);
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
    line-height: 0.8;
    color: var(--color);
    // visibility: hidden;
  }

  &__subtitle {
    // font-family: var(--bodyFont);
    font-family: var(--titleFont);
    font-weight: 200;
    color: var(--color);
    font-size: 36px;
    margin: 0;
    letter-spacing: 1.5px;
    line-height: 1;
  }
}

.link {
  &__arrow {
    position: relative;
    top: 4px;
    height: 57px;
    width: 57px;
    --buttonColor: var(--color);
  }

  &__text {
    font-family: var(--titleFont);
    font-size: 80px;
    line-height: 0.8;
    color: var(--color);
    margin: 0 0 0 20px;
    font-weight: 800;
  }
}
</style>
