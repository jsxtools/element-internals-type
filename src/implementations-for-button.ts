import type { Upgrade } from "./feature.ts"

let _commandable: Upgrade<HTMLButtonElement> = (host, _ints, scope) => {
	type CommandEvent = Event & { command: string }
	type CommandEventConstructor = { new (): CommandEvent }

	let CommandEvent = (scope as any).CommandEvent as CommandEventConstructor | undefined
	let commandAssociatedElements = new WeakMap<Element, HTMLElement>()

	return CommandEvent ? [
		{
			set commandForElement(targetElement) {
				if (targetElement === null) {
					host.removeAttribute("commandfor")
					commandAssociatedElements.delete(host)
				} else if (!(targetElement instanceof Element)) {
					throw new TypeError(`commandForElement must be an element or null`)
				} else {
					host.setAttribute("commandfor", "")

					let targetRootNode = targetElement.getRootNode()
					let thisRootNode = host.getRootNode()

					if (thisRootNode === targetRootNode || targetRootNode === host.ownerDocument) {
						commandAssociatedElements.set(host, targetElement)
					} else {
						commandAssociatedElements.delete(host)
					}
				}
			},
			get commandForElement() {
				if (host.disabled) {
					return null
				}

				if (host.form) {
					return null
				}

				let targetElement = commandAssociatedElements.get(host)

				if (targetElement) {
					if (targetElement.isConnected) {
						return targetElement
					}

					commandAssociatedElements.delete(host)

					return null
				}

				let root = host.getRootNode()
				let idref = host.getAttribute("commandfor")

				return idref && (root instanceof Document || root instanceof ShadowRoot) ? root.getElementById(idref) : null
			},
			get command(): "show-modal" | "close" | "toggle-popover" | "hide-popover" | "show-popover" | `--${string}` | "" {
				let value = host.getAttribute("command") ?? ""

				if (value.startsWith("--")) return value as `--${string}`

				let valueLower = value.toLowerCase()

				switch (valueLower) {
					case "show-modal":
					case "close":
					case "toggle-popover":
					case "hide-popover":
					case "show-popover":
						return valueLower
				}

				return ""
			},
			set command(value: string) {
				host.setAttribute("command", value)
			},
		}
	]: []
}

let _clickable: Upgrade = (host) => {
	let handleClick = (event: KeyboardEvent) => {
		let { target } = event as any as { target: HTMLSpanElement }
	
		switch (event.key) {
			// @ts-ignore fallthrough is desired
			case event.type === "keydown" && "Enter":
				target.click()
	
			case " ":
				event.preventDefault()
	
				if (!event.altKey && event.type === "keyup") {
					target.click()
				}
		}
	}

	host.addEventListener("keydown", handleClick)
	host.addEventListener("keyup", handleClick)

	return []
}

let _controlable: Upgrade<HTMLInputElement> = (host, ints) => {
	let controlValue: string | null = null

	let update = () => {
		if ((host as any).__proto__.constructor.formAssociated) {
			ints.setFormValue(host.value || null)

			ints.setValidity(host.required && !host.value ? { valueMissing: true } : {}, "Please give this a value if you want to proceed.")
		}
	}

	let observer = new MutationObserver((records) => {
		for (record of records) {
			if (record.attributeName === "disabled") {
				ints.ariaDisabled = String(host.hasAttribute("disabled"))
			} else if (record.attributeName === "required") {
				ints.ariaRequired = String(host.hasAttribute("required"))
			}
		}

		update()
	})

	let record: MutationRecord
	
	observer.observe(host, {
		attributes: true,
		attributeFilter: ["disabled", "required", "value"],
	})
	
	observer.takeRecords()

	queueMicrotask(update)

	return [
		{
			get disabled(): boolean {
				return host.hasAttribute("disabled")
			},
			set disabled(flag: boolean) {
				host.toggleAttribute("disabled", flag)
			},
			get required(): boolean {
				return host.hasAttribute("required")
			},
			set required(flag: boolean) {
				host.toggleAttribute("required", flag)
			},
			set name(name: string) {
				host.setAttribute("name", name)
			},
			get name(): string {
				return host.getAttribute("name") ?? ""
			},
			get defaultValue(): string {
				return host.getAttribute("value") ?? ""
			},

			set defaultValue(value: string) {
				host.setAttribute("value", value)
			},

			get form(): HTMLFormElement | null {
				return ints.form
			},

			get validity(): ValidityState {
				return ints.validity
			},

			get validationMessage(): string {
				return ints.validationMessage
			},

			get willValidate(): boolean {
				return ints.willValidate
			},

			checkValidity(): boolean {
				return ints.validity.valid
			},

			setCustomValidity(message: string): void {
				let customError = Boolean(message)

				ints.setValidity({ customError }, message)
			},

			reportValidity(): boolean {
				return ints.reportValidity()
			},
			
			/** Current value of the control. */
			get value(): string {
				return controlValue ?? this.defaultValue
			},

			set value(value: string) {
				controlValue = String(value)

				update()
			},
		},
	]
}

export let button: Upgrade<HTMLButtonElement> = (host, ints, glob) => {
	ints.role = "button"

	return [
		..._controlable(host as HTMLInputElement, ints, glob),
		..._clickable(host, ints, glob),
		..._commandable(host, ints, glob),
	]
}

export let reset: Upgrade<HTMLButtonElement> = (host, ints, glob) => {
	ints.role = "button"

	host.addEventListener("click", () => {
		ints.form?.reset()
	})

	return [
		..._controlable(host as HTMLInputElement, ints, glob),
		..._clickable(host, ints, glob),
	]
}

export let submit: Upgrade<HTMLButtonElement> = (host, ints, glob) => {
	host.addEventListener("click", () => {
		ints.form?.requestSubmit()
	})

	return [
		..._controlable(host as HTMLInputElement, ints, glob),
		..._clickable(host, ints, glob),
	]
}
