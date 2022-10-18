import ResizeObserver from 'resize-observer-polyfill'
import tuple from '~~/utils/types/tuple'

export default function useBoundingRect() {
  const element = ref<HTMLElement>()
  const boundingRect = ref<DOMRect>()

  useCleanup(() => {
    const onObserve = () => {
      boundingRect.value = element.value?.getBoundingClientRect()
    }
    window.addEventListener('resize', onObserve)
    const observer = new ResizeObserver(onObserve)
    observer.observe(element.value!)
    onObserve()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onObserve)
    }
  })

  return tuple(element, boundingRect)
}
