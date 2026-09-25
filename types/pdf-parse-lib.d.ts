// pdf-parse@1.x's package root (index.js) has a debug harness that runs at
// import time under bundlers (see the comment in app/api/parse-resume/route.ts),
// so we import its inner implementation file directly instead. That path has
// no shipped types, so this declares the minimal shape we actually use.
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: Record<string, unknown>): Promise<PdfParseResult>;

  export default pdfParse;
}
