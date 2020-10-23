import { promises as fs } from 'fs'
import StripProjectRoot from '../StripProjectRoot'
import path from 'path'
import { noopLogger } from '../../Logger'

test('StripProjectRoot transformer: typescript example', async () => {
  const projectRoot = path.join(__dirname, 'fixtures', 'typescript')
  const sourceMapJson = JSON.parse(await fs.readFile(path.join(projectRoot, 'dist', 'out.js.map'), 'utf-8'))
  await StripProjectRoot('dist/out.js.map', sourceMapJson, projectRoot, noopLogger)
  expect(sourceMapJson.sources).toHaveLength(2)
  expect(sourceMapJson.sources[0]).toBe(path.join('lib', 'a.ts'))
  expect(sourceMapJson.sources[1]).toBe('index.ts')
})

test('StripProjectRoot transformer: ignore errors when source map is in an unexpected format', async () => {
  const projectRoot = path.join(__dirname, 'fixtures', 'typescript')
  await StripProjectRoot('out.js.map', 1, projectRoot, noopLogger)
})

test('StripProjectRoot transformer: webpack example', async () => {
  const projectRoot = path.join(__dirname, 'fixtures', 'webpack')
  const sourceMapJson = JSON.parse(await fs.readFile(path.join(projectRoot, 'dist', 'main.js.map'), 'utf-8'))
  await StripProjectRoot('dist/main.js.map', sourceMapJson, projectRoot, noopLogger)
  expect(sourceMapJson.sources).toHaveLength(3)
  expect(sourceMapJson.sources[0]).toBe(path.join('lib', 'a.js'))
  expect(sourceMapJson.sources[1]).toBe('webpack:///webpack/bootstrap')
  expect(sourceMapJson.sources[2]).toBe('index.js')
})

test('StripProjectRoot transformer: webpack example (synthetic sections)', async () => {
  const projectRoot = path.join(__dirname, 'fixtures', 'webpack')
  const sourceMapJson = { sections: [ { map: JSON.parse(await fs.readFile(path.join(projectRoot, 'dist', 'main.js.map'), 'utf-8')) } ] }
  await StripProjectRoot('dist/main.js.map', sourceMapJson, projectRoot, noopLogger)
  expect(sourceMapJson.sections[0].map.sources).toHaveLength(3)
  expect(sourceMapJson.sections[0].map.sources[0]).toBe(path.join('lib', 'a.js'))
  expect(sourceMapJson.sections[0].map.sources[1]).toBe('webpack:///webpack/bootstrap')
  expect(sourceMapJson.sections[0].map.sources[2]).toBe('index.js')
})