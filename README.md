# ElementInternals.type

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Coverage][cov-img]][cov-url]

This is a ponyfill for the `type` property on `ElementInternals`.

```js
class CustomButton extends HTMLElement {
  static formAssociated = true;

  #internals = this.attachInternals();

  constructor() {
    super();

    this.#internals.type = 'button';
  }
}

customElements.define('custom-button', CustomButton);
```

When `elementInternals.type = 'button'` is set in a custom element's constructor, the custom element will gain support for the attributes listed below.

- [`disabled`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#dom-fe-disabled)
- [`labels`](https://html.spec.whatwg.org/multipage/forms.html#dom-lfe-labels)
- [`form`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#dom-fae-form)
- [`popovertarget`](https://html.spec.whatwg.org/multipage/popover.html#attr-popovertarget)
- [`popovertargetaction`](https://html.spec.whatwg.org/multipage/popover.html#attr-popovertargetaction)
- [`command`](https://html.spec.whatwg.org/#attr-button-command)
- [`commandfor`](https://html.spec.whatwg.org/#attr-button-commandfor)

## Features

- 🚀 **Fully Typed**: Full type safety and autocompletion
- 🧠 **Fully Tested**: Full 100% test coverage
- 📦 **Tree-shakeable**: Only import what you need
- ⚡ **Performance Optimized**: Efficient updates and rendering

## Installation

```shell
npm install element-internals-type
```

- [Explainer](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/ElementInternalsType/explainer.md)
- [WHATWG Tracking Issue](https://github.com/whatwg/html/issues/11061)
- [Design Document](https://docs.google.com/document/d/1mEAHpBRvqWGxorJB_PIG346gc4U3I5A5SL3q9vYImxc/edit?tab=t.0#heading=h.7nki9mck5t64)

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b your/amazing-feature`)
3. Commit your changes (`git commit -m "Add some amazing feature"`)
4. Push to the branch (`git push origin your/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT No Attribution License](https://opensource.org/license/mit-0).

[npm-img]: https://img.shields.io/npm/v/element-internals-type
[npm-url]: https://www.npmjs.com/package/element-internals-type
[cli-img]: https://github.com/jsxtools/element-internals-type/actions/workflows/check.yml/badge.svg
[cli-url]: https://github.com/jsxtools/element-internals-type/actions/workflows/check.yml
[cov-img]: https://codecov.io/gh/jsxtools/element-internals-type/graph/badge.svg
[cov-url]: https://codecov.io/gh/jsxtools/element-internals-type
