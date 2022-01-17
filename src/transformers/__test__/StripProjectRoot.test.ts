import { promises as fs } from 'fs'
import StripProjectRoot from '../StripProjectRoot'
import path from 'path'
import { noopLogger } from '../../Logger'

test('StripProjectRoot transformer: typescript example', async () => {
  const projectRoot = path.join(__dirname, 'fixtures', 'typescript')
  const absolutePath = path.join(projectRoot, 'dist', 'out.js.map')
  const sourceMapJson = JSON.parse(await fs.readFile(absolutePath, 'utf-8'))
  await StripProjectRoot(absolutePath, sourceMapJson, projectRoot, noopLogger)
  expect(sourceMapJson.sources).toHaveLength(2)
  expect(sourceMapJson.sources[0]).toBe(path.join('lib', 'a.ts'))
  expect(sourceMapJson.sources[1]).toBe('index.ts')
})

test('StripProjectRoot transformer: ignore errors when source map is in an unexpected format', async () => {
  const projectRoot = path.join(__dirname, 'fixtures', 'typescript')
  const absolutePath = path.join(projectRoot, 'dist', 'out.js.map')
  await StripProjectRoot(absolutePath, 1, projectRoot, noopLogger)
})

test('StripProjectRoot transformer: webpack example', async () => {
  const projectRoot = path.join(__dirname, 'fixtures', 'webpack')
  const absolutePath = path.join(projectRoot, 'dist', 'main.js.map')
  const sourceMapJson = JSON.parse(await fs.readFile(absolutePath, 'utf-8'))
  await StripProjectRoot(absolutePath, sourceMapJson, projectRoot, noopLogger)
  expect(sourceMapJson.sources).toHaveLength(3)
  expect(sourceMapJson.sources[0]).toBe(path.join('lib', 'a.js'))
  expect(sourceMapJson.sources[1]).toBe('webpack:///webpack/bootstrap')
  expect(sourceMapJson.sources[2]).toBe('index.js')
})

test('StripProjectRoot transformer: webpack example (synthetic sections)', async () => {
  const projectRoot = path.join(__dirname, 'fixtures', 'webpack')
  const absolutePath = path.join(projectRoot, 'dist', 'main.js.map')
  const sourceMapJson = { sections: [ { map: JSON.parse(await fs.readFile(absolutePath, 'utf-8')) } ] }
  await StripProjectRoot(absolutePath, sourceMapJson, projectRoot, noopLogger)
  expect(sourceMapJson.sections[0].map.sources).toHaveLength(3)
  expect(sourceMapJson.sections[0].map.sources[0]).toBe(path.join('lib', 'a.js'))
  expect(sourceMapJson.sections[0].map.sources[1]).toBe('webpack:///webpack/bootstrap')
  expect(sourceMapJson.sections[0].map.sources[2]).toBe('index.js')
})

test('StripProjectRoot transformer: webpack example with namespace', async () => {
  const projectRoot = path.join(__dirname, 'fixtures', 'webpack-2')
  const absolutePath = path.join(projectRoot, 'dist', 'main.js.map')
  const sourceMapJson = { sections: [ { map: JSON.parse(await fs.readFile(absolutePath, 'utf-8')) } ] }
  await StripProjectRoot(absolutePath, sourceMapJson, projectRoot, noopLogger)
  expect(sourceMapJson.sections[0].map.sources).toHaveLength(3)
  expect(sourceMapJson.sections[0].map.sources[0]).toBe(path.join('lib', 'a.js'))
  expect(sourceMapJson.sections[0].map.sources[1]).toBe('webpack:///webpack/bootstrap')
  expect(sourceMapJson.sections[0].map.sources[2]).toBe('index.js')
})