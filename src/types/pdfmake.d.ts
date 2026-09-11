declare module 'pdfmake' {
  export interface TFontFamily {
    normal?: string | Uint8Array
    bold?: string | Uint8Array
    italics?: string | Uint8Array
    bolditalics?: string | Uint8Array
  }

  export interface TFontFamilies {
    [familyName: string]: TFontFamily
  }

  export interface TDocumentDefinitions {
    pageSize?: string
    pageOrientation?: 'portrait' | 'landscape'
    pageMargins?: [number, number, number, number]
    content: unknown[]
    info?: { title?: string; author?: string }
    defaultStyle?: Record<string, unknown>
    styles?: Record<string, Record<string, unknown>>
    footer?: (currentPage: number, pageCount: number) => unknown
  }

  export interface OutputDocument {
    getBuffer(): Promise<Buffer>
    getBase64(): Promise<string>
  }

  export interface VirtualFileSystem {
    writeFileSync(
      filename: string,
      content: string | Uint8Array,
      options?: string,
    ): void
  }

  export interface PdfMake {
    virtualfs: VirtualFileSystem
    createPdf(
      docDefinition: TDocumentDefinitions,
      options?: Record<string, unknown>,
    ): OutputDocument
    setFonts(fonts: TFontFamilies): void
    setUrlAccessPolicy(callback: () => boolean): void
    setLocalAccessPolicy(callback: () => boolean): void
  }

  const pdfmake: PdfMake
  export default pdfmake
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: Record<string, string>
  export default vfs
}
