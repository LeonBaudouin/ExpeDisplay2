export default function useTextRect(name: string) {
  const [element, rect] = useBoundingRect()
  const { $webgl } = useNuxtApp()

  watch(
    rect,
    (boundingRect) => {
      if (!boundingRect) return
      const computedStyle = window.getComputedStyle(element.value!)
      const pixelSize = computedStyle.fontSize.replace('px', '')
      $webgl.state.textRects[name] = {
        x: boundingRect.left + boundingRect.width / 2 - window.innerWidth / 2,
        y: boundingRect.top + boundingRect.height / 2 - window.innerHeight / 2,
        scale: Number(pixelSize) / 36,
      }
    },
    { immediate: true }
  )

  return element
}
