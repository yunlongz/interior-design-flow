declare module 'sortablejs' {
  interface SortableEvent {
    item: HTMLElement
    from: HTMLElement
    to: HTMLElement
    oldIndex: number
    newIndex: number
  }

  interface GroupOptions {
    name: string
    pull?: boolean | string | ((to: any, from: any, dragEl: HTMLElement, event: Event) => boolean | string)
    put?: boolean | string | ((to: any, from: any, dragEl: HTMLElement, event: Event) => boolean)
  }

  interface SortableOptions {
    group?: string | GroupOptions
    animation?: number
    ghostClass?: string
    dragClass?: string
    chosenClass?: string
    forceFallback?: boolean
    fallbackClass?: string
    onEnd?: (evt: SortableEvent) => void
    [key: string]: any
  }

  class Sortable {
    constructor(el: HTMLElement, options?: SortableOptions)
    static get(el: HTMLElement): Sortable | undefined
    destroy(): void
    toArray(): string[]
    sort(order: string[]): void
  }

  export default Sortable
}
