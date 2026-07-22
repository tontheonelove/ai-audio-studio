export interface TranscribeRequest {
  sourceLang: string;
  file?: File;
  url?: string;
}

export interface TranscribeResponse {
  blob: Blob;
  filename: string;
}

export interface ProcessStatus {
  state: "idle" | "processing" | "success" | "error";
  progress: number;
  message: string;
}

export interface LanguageOption {
  value: string;
  label: string;
  flag: string;
}