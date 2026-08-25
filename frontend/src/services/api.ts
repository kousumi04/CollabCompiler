import type { ExecuteResponse, SupportedLanguage } from '../types/compiler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function runCodeApi(
  language: SupportedLanguage,
  code: string,
  stdin: string = ''
): Promise<ExecuteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      language,
      code,
      stdin,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Execution failed with HTTP status ${response.status}`);
  }

  return response.json();
}