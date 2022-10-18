import WebGL from '~~/webgl'

export default defineNuxtPlugin<{ webgl: WebGL }>((nuxtApp) => {
  let webgl
  try {
    webgl = new WebGL(nuxtApp)
  } catch (error) {
    console.error(error)
  }
  return {
    provide: {
      webgl,
    },
  }
})
