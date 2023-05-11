const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

export const isErrnoException = (value: unknown): value is NodeJS.ErrnoException => {
  return isObject(value) &&
    typeof value.errno === 'number' &&
    typeof value.code === 'string' &&
    typeof value.path === 'string' &&
    typeof value.syscall === 'string' &&
    typeof value.stack === 'string'
}

export default function stringifyFileAccessError (e: NodeJS.ErrnoException): string {
  switch (e.code) {
    case 'ENOENT':
      return `No file exists at the provided path.`
      break
    case 'EISDIR':
      return `The path contained a directory, not a file.`
      break
    case 'EACCES':
      return `This process did not have sufficient permissions to read the file.`
      break
    default:
      return `Tried at the following location.`
  }
}