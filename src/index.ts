interface PEventHandler {
  onDown: Function
  onUp?: Function
}

export class Pointer {
  /*
   * Reference:
   * https://www.w3.org/TR/pointerevents2/
   */

  static Button = Object.freeze({
    LEFT_MOUSE: 0,
    MIDDLE_MOUSE: 1,
    RIGHT_MOUSE: 2,
    PEN_CONTACT: 0,
    PEN_BARREL: 2,
    PEN_ERASER: 5,
    TOUCH_CONTACT: 0
  })

  static Type = Object.freeze({
    MOUSE: 'mouse',
    PEN: 'pen',
    TOUCH: 'touch'
  })

  #leftMouseFlag: boolean
  #middleMouseFlag: boolean
  #rightMouseFlag: boolean
  #penContactFlag: boolean
  #penBarrelFlag: boolean
  #penEraserFlag: boolean
  #touchFlag: boolean
  #primaryStateChangeListeners: PEventHandler[]
  #middleStateChangeListeners: PEventHandler[]
  #auxiliaryStateChangeListeners: PEventHandler[]
  #movementListeners: Function[]
  #dragListeners: Function[]
  #context: HTMLElement

  #updatePointerState(e: any, state: boolean) {
    switch (e.pointerType) {
      case Pointer.Type.MOUSE:
        switch (e.button) {
          case Pointer.Button.LEFT_MOUSE:
            this.#leftMouseFlag = state
            break

          case Pointer.Button.MIDDLE_MOUSE:
            this.#middleMouseFlag = state
            break

          case Pointer.Button.RIGHT_MOUSE:
            this.#rightMouseFlag = state
            break
        }
        break

      case Pointer.Type.PEN:
        switch (e.button) {
          case Pointer.Button.PEN_CONTACT:
            this.#penContactFlag = state
            break

          case Pointer.Button.PEN_BARREL:
            this.#penBarrelFlag = state
            break

          case Pointer.Button.PEN_ERASER:
            this.#penEraserFlag = state
            break
        }
        break

      case Pointer.Type.TOUCH:
        this.#touchFlag = state
        break
    }
  }

  #handlePointerStateChange(e: any, down: boolean) {
    const prevPrimaryPressed = this.primaryPressed
    const prevMiddlePressed = this.middlePressed
    const prevAuxiliaryPressed = this.auxiliaryPressed

    this.#updatePointerState(e, down)

    if (this.primaryPressed !== prevPrimaryPressed) {
      this.#primaryStateChangeListeners.forEach((handler) => {
        if (down) {
          handler.onUp = handler.onDown?.call(this.#context, e)
        } else {
          handler.onUp?.call(this.#context)
        }
      })
    }
    if (this.middlePressed !== prevMiddlePressed) {
      this.#middleStateChangeListeners.forEach((handler) => {
        if (down) {
          handler.onUp = handler.onDown?.call(this.#context, e)
        } else {
          handler.onUp?.call(this.#context)
        }
      })
    }
    if (this.auxiliaryPressed !== prevAuxiliaryPressed) {
      this.#auxiliaryStateChangeListeners.forEach((handler) => {
        if (down) {
          handler.onUp = handler.onDown?.call(this.#context, e)
        } else {
          handler.onUp?.call(this.#context)
        }
      })
    }
  }

  #handlePointerMove(e: any) {
    this.#movementListeners.forEach((listener) => listener.call(this, e))
  }

  #handlePointerDrag(e: any) {
    this.#dragListeners.forEach((listener: Function) => listener.call(this, e))
  }

  constructor(context: HTMLElement, parent = window) {
    this.#context = context

    this.clearListeners()

    const onDrag = (e: any) => this.#handlePointerDrag(e)

    context.addEventListener('pointerdown', (e) => {
      this.#handlePointerStateChange(e, true)
      parent.addEventListener(
        'pointerup',
        (e) => {
          this.#handlePointerStateChange(e, false)
          parent.removeEventListener('pointermove', onDrag)
        },
        { once: true }
      )
      parent.addEventListener('pointermove', onDrag)
    })
    context.addEventListener('pointermove', (e) => this.#handlePointerMove(e))
    context.ondragstart = () => false

    parent.addEventListener('pointermove', (e) => e.preventDefault(), {
      passive: false
    })
  }

  get context(): HTMLElement {
    return this.#context
  }

  get primaryPressed(): boolean {
    return this.#leftMouseFlag || this.#penContactFlag || this.#touchFlag
  }

  get middlePressed(): boolean {
    return this.#middleMouseFlag
  }

  get auxiliaryPressed(): boolean {
    return this.#rightMouseFlag || this.#penBarrelFlag || this.#penEraserFlag
  }

  addPrimaryStateListener(onDown: Function) {
    this.#primaryStateChangeListeners.push({ onDown })
  }

  removePrimaryStateListener(onDown: Function) {
    const index = this.#primaryStateChangeListeners.findIndex(
      (v) => v.onDown === onDown
    )
    if (index === -1) return
    this.#primaryStateChangeListeners.splice(index, 1)
  }

  clearPrimaryStateListeners() {
    this.#primaryStateChangeListeners = []
  }

  addMiddleStateListener(onDown: Function) {
    this.#middleStateChangeListeners.push({ onDown })
  }

  removeMiddleStateListener(onDown: Function) {
    const index = this.#middleStateChangeListeners.findIndex(
      (v) => v.onDown === onDown
    )
    if (index === -1) return
    this.#middleStateChangeListeners.splice(index, 1)
  }

  clearMiddleStateListeners() {
    this.#middleStateChangeListeners = []
  }

  addAuxiliaryStateListener(onDown: Function) {
    this.#auxiliaryStateChangeListeners.push({ onDown })
  }

  removeAuxiliaryStateListener(onDown: Function) {
    const index = this.#auxiliaryStateChangeListeners.findIndex(
      (v) => v.onDown === onDown
    )
    if (index === -1) return
    this.#auxiliaryStateChangeListeners.splice(index, 1)
  }

  clearAuxiliaryStateListeners() {
    this.#auxiliaryStateChangeListeners = []
  }

  addMovementListener(onMove: Function) {
    this.#movementListeners.push(onMove)
  }

  removeMovementListener(onMove: Function) {
    const index = this.#movementListeners.indexOf(onMove)
    if (index === -1) return
    this.#movementListeners.splice(index, 1)
  }

  clearMovementListeners() {
    this.#movementListeners = []
  }

  addDragListener(onDrag: Function) {
    this.#dragListeners.push(onDrag)
  }

  removeDragtListener(onMove: Function) {
    const index = this.#dragListeners.indexOf(onMove)
    if (index === -1) return
    this.#dragListeners.splice(index, 1)
  }

  clearDragListeners() {
    this.#dragListeners = []
  }

  clearListeners() {
    this.clearPrimaryStateListeners()
    this.clearMiddleStateListeners()
    this.clearAuxiliaryStateListeners()
    this.clearMovementListeners()
    this.clearDragListeners()
  }
}
