export let handleElementInternalsType: Feature = (scope, implementations) => {
	if (scope.HTMLElement && scope.ElementInternals) {
		let protoOfHTMLElement = scope.HTMLElement.prototype
		let protoOfElementInternals = scope.ElementInternals.prototype
		let { attachInternals } = protoOfHTMLElement

		let ref = new WeakMap<ElementInternals, [string, HTMLElement, boolean]>
		let die = () => {
			throw TypeError("Illegal invocation")
		}
		let get = (ints: ElementInternals) => {
			any = ref.get(ints)

			if (!any) {
				die()
			}

			return any!
		}
		let host: HTMLElement
		let any
		let key

		Object.assign(protoOfHTMLElement, {
			attachInternals(this: HTMLElement): ElementInternals {
				ref.set(any = attachInternals.call(this), ["", this, false])

				return any
			},
		})

		Object.defineProperties(protoOfElementInternals, Object.getOwnPropertyDescriptors({
			// @ts-ignore deliberate prototype extention
			get type(): string {
				return get(this as unknown as ElementInternals)[0]
			},
			set type(type: string) {
				console.log('so far')
				any = get(this as unknown as ElementInternals)

				if (any[2]) {
					die()
				}

				host = any[1]
				any[2] = true
				any[0] = type = String(type).toLowerCase()

				implementations[type]!().then((module) => {
					for (any of module[type]!(host as HTMLElement, this, global)) {
						for (key of Reflect.ownKeys(any)) {
							if (!Reflect.has(host, key)) {
								Object.defineProperty(host, key, Object.getOwnPropertyDescriptor(any, key)!)
							}
						}
					}
				})
			},
		} satisfies ElementInternals))
	}
}

export type Feature = (global: typeof globalThis, implementations: Implementations) => void

export type Implementations = {
	[type: string]: AsyncUpgrade
}

export type AsyncUpgrade = () => Promise<Record<string, Upgrade>>

export type Upgrade<T extends HTMLElement = any> = (element: T, internals: ElementInternals, global: typeof globalThis) => Mixin[]

export type Mixin = Record<string | symbol, any>
