export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

export const AI_PROVIDERS = [
  { value: 'openai' as const, label: '🤖 OpenAI', needsKey: true },
  { value: 'anthropic' as const, label: '🧠 Anthropic', needsKey: true },
  { value: 'google' as const, label: '🔍 Google AI', needsKey: true },
];

export const AI_MODELS: Record<AIProvider, AIModel[]> = {
  openai: [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Latest)', provider: 'anthropic' },
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
  ],
  google: [
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)', provider: 'google' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
  ],
};

export const PRIVACY_NOTICE = `🔒 Privacy Notice: Your API key is only stored in your browser's memory for this session and is never sent to our servers or stored permanently. It's used directly to communicate with your chosen AI provider.`;
