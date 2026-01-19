
export interface ReplacementPair {
  id: string;
  findText: string;
  replaceText: string;
}

export interface ReplacementOptions {
  pairs: ReplacementPair[];
  caseSensitive: boolean;
  wholeWord: boolean;
}

export interface ProcessingResult {
  success: boolean;
  replacementsMade: number;
  updatedPdfUrl: string | null;
  error?: string;
  fileName: string;
}

export interface PdfMetadata {
  name: string;
  size: number;
  lastModified: number;
}
