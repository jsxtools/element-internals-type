import type { Feature, Mixin } from "./feature.ts"

let handleElementInternalsType: Feature = (global, implementations) => {
	if (global.HTMLElement && global.ElementInternals) {
		let protoOfHTMLElement = global.HTMLElement.prototype
		let protoOfElementInternals = global.ElementInternals.prototype
		let { attachInternals } = protoOfHTMLElement

		let map = new WeakMap<ElementInternals, [string, boolean, HTMLElement]>
		let die = () => {
			throw TypeError("Illegal invocation")
		}
		let get = (ints: ElementInternals) => {
			ref = map.get(ints)

			if (!ref) {
				die()
			}

			return ref!
		}
		let ref

		Object.assign(protoOfHTMLElement, {
			attachInternals(this: HTMLElement): ElementInternals {
				map.set(ref = attachInternals.call(this), ["", false, this])

				return ref
			},
		})

		Object.defineProperties(protoOfElementInternals, Object.getOwnPropertyDescriptors({
			// @ts-ignore deliberate prototype extention
			get type(): string {
				return get(this)[0]
			},
			set type(type: string) {
				let ref = get(this)
				let key: string | symbol
				let mix: Mixin

				if (ref[1]) {
					die()
				}

				ref[0] = type = String(type).toLowerCase()
				ref[1] = true

				implementations[type]!().then((module) => {
					for (mix of module[type]!(ref[2], this, global)) {
						for (key of Reflect.ownKeys(mix)) {
							if (!Reflect.has(ref[2], key)) {
								Object.defineProperty(ref[2], key, Object.getOwnPropertyDescriptor(mix, key)!)
							}
						}
					}
				})
			},
		} satisfies ElementInternals))
	}
}

handleElementInternalsType(
	globalThis,
	{
		button: () => import("./implementations-for-button.js"),
		reset: () => import("./implementations-for-button.js"),
		submit: () => import("./implementations-for-button.js"),
		label: () => import("./implementations-for-label.js"),
	}
)
