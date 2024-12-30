export interface ExtensionStatus {
  installed: boolean;
  version: string | null;
}

export interface ExtensionMessage {
  type: 'STATUS_CHECK' | 'CPU_METRICS';
  payload?: any;
}

export interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
}