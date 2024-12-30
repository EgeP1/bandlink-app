import type { ExtensionStatus, ExtensionMessage, ExtensionResponse } from './types';

const EXTENSION_ID = 'bandlink-cpu-extension'; // Replace with actual extension ID

export async function checkExtensionInstalled(): Promise<ExtensionStatus> {
  try {
    const response = await sendMessageToExtension({ type: 'STATUS_CHECK' });
    return {
      installed: response.success,
      version: response.data?.version || null
    };
  } catch (error) {
    return {
      installed: false,
      version: null
    };
  }
}

async function sendMessageToExtension(message: ExtensionMessage): Promise<ExtensionResponse> {
  if (!window.chrome?.runtime?.sendMessage) {
    throw new Error('Chrome runtime not available');
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
      resolve(response || { success: false, error: 'No response from extension' });
    });
  });
}