import A from './lib/a'
import B from './lib/b'

console.log('hi from index')

const b = new B()
const a = new A(b)

a.hello()
