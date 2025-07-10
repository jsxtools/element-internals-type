/// <reference path="./types/aria-mixin.ts" />

import type { Upgrade } from "./feature.ts"

export let label: Upgrade<HTMLLabelElement> = (host, ints) => {
	let update: Update = () => {
		if (host.control) {
			host.control!.ariaLabelledByElements = [host]
		}
	}

	let handleClick = (event: MouseEvent) => {
		let { control } = host

		if (control) {
			event.preventDefault()

			control.focus?.()
			control.click?.()
		}
	}

	let observer = new MutationObserver(update)

	observer.observe(host, {
		attributes: true,
		attributeFilter: ["for"],
	})

	host.addEventListener("click", handleClick)

	queueMicrotask(update)

	return [
		{
			get form(): HTMLFormElement | null {
				return ints.form
			},
			get htmlFor(): string {
				return host.getAttribute("for") ?? ""
			},
			set htmlFor(value: string) {
				host.setAttribute("for", value)

				update()
			},
			get control(): HTMLElement | null {
				if (this.htmlFor) {
					for (let element of host.closest("form")?.elements || []) {
						if (element.id === host.htmlFor) {
							return element as HTMLElement
						}
					}
				} else {
					for (let element of host.querySelectorAll<HTMLElement>(":valid,:invalid")) {
						if (host.contains(element)) {
							return element as HTMLElement
						}
					}
				}

				return null
			},
		}
	]
}

type Update = (...args: any[]) => void
