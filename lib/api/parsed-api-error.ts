export interface ParsedApiError {
  status: number;
  message: string;
}

const STATUS_PREFIX_RE = /^\[(\d+)\]\s*/;

export function parseApiError(error: unknown): ParsedApiError {
  if (!(error instanceof Error)) {
    return { status: 0, message: "Terjadi kesalahan yang tidak diketahui." };
  }

  const match = STATUS_PREFIX_RE.exec(error.message);
  if (!match) {
    return { status: 0, message: error.message };
  }

  return {
    status: Number(match[1]),
    message: error.message.slice(match[0].length),
  };
}

export function formatApiError(status: number, message: string): Error {
  return new Error(`[${status}] ${message}`);
}
