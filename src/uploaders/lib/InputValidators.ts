export function validateRequiredStrings (opts: Record<string, unknown>, keys: string[]): void {
  // required strings
  for (const requiredString of keys) {
    if (typeof opts[requiredString] !== 'string' || (opts[requiredString] as string).length === 0) {
      throw new Error(`${requiredString} is required and must be a string`)
    }
  }
}

export function validateOptionalStrings (opts: Record<string, unknown>, keys: string[]): void {
  for (const optionalString of keys) {
    if (typeof opts[optionalString] !== 'undefined') {
      if (typeof opts[optionalString] !== 'string' || (opts[optionalString] as string).length === 0) {
        throw new Error(`${optionalString} must be a string`)
      }
    }
  }
}

export function validateBooleans (opts: Record<string, unknown>, keys: string[]): void {
  for (const bool of keys) {
    if (typeof opts[bool] !== 'boolean') {
      throw new Error(`${bool} must be true or false`)
    }
  }
}

export function validateObjects (opts: Record<string, unknown>, keys: string[]): void {
  for (const obj of keys) {
    if (typeof opts[obj] !== 'object' || !opts[obj]) {
      throw new Error(`${obj} must be an object`)
    }
  }
}

export function validateNoUnknownArgs (unknownArgs: Record<string, unknown>): void {
  if (Object.keys(unknownArgs).length > 0) {
    throw new Error(`Unrecognized option(s): ${Object.keys(unknownArgs).join(', ')}`)
  }
}