export default class A {
  constructor(b) {
    this.b = b
  }

  hello() {
    this.b.hey()

    console.log('hello')
  }
}
