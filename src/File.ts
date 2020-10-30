class File {
  readonly filepath: string
  readonly data: string

  constructor(filepath: string, data: string) {
    this.filepath = filepath
    this.data = data
  }
}

export default File
