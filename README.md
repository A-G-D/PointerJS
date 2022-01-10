# PointerJS

> Javascript library that provides convenient and common API for handling events of different types of pointer devices

[![NPM](https://img.shields.io/npm/v/component.svg)](https://www.npmjs.com/package/component) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @pointerjs/pointer
```

or

```bash
yarn add @pointerjs/pointer
```

## Usage

```ts
import { Pointer } from '@pointerjs/pointer'

const canvas = querySelector('#main-canvas')
const pointer = new Pointer(canvas)
pointer.addMovementHandler((e) => {
  console.log(`Pointer( ${e.pageX}, ${e.pageY} )`)
})
```

## Contributing

Pull Requests are Welcome.

## License

This repository is released under [MIT License](LICENSE).
