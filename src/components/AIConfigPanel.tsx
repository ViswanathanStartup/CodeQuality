import { useState } from 'react';
import { Card } from './ui/card';
import { Select } from './ui/select';
import { Settings, Eye, EyeOff, Info } from 'lucide-react';
import { AI_PROVIDERS, AI_MODELS, PRIVACY_NOTICE, type AIProvider, type AIConfig } from '@/types/ai-config';

interface AIConfigPanelProps {
  config: AIConfig;
  onChange: (config: AIConfig) => void;
}

export default function AIConfigPanel({ config, onChange }: AIConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const selectedProvider = AI_PROVIDERS.find(p => p.value === config.provider);
  const needsApiKey = selectedProvider?.needsKey || false;
  const availableModels = AI_MODELS[config.provider] || [];

  const handleProviderChange = (provider: AIProvider) => {
    const defaultModel = AI_MODELS[provider]?.[0]?.id || 'gpt-4o-mini';
    onChange({
      provider,
      model: defaultModel,
      apiKey: config.apiKey,
    });
  };

  return (
    <Card className="border-2 border-primary/20">
      <div className="p-4">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">AI Configuration</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedProvider?.label} • {availableModels.find(m => m.id === config.model)?.name || config.model}
            </span>
            <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              <Select
                value={config.provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                className="w-full"
              >
                {AI_PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <Select
                value={config.model}
                onChange={(e) => onChange({ ...config, model: e.target.value })}
                className="w-full"
                disabled={!availableModels.length}
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* API Key Input */}
            {needsApiKey && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
                    placeholder={`Enter your ${selectedProvider?.label} API key`}
                    className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Privacy Notice */}
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      {PRIVACY_NOTICE}
                    </p>
                  </div>
                </div>

                {/* API Key Help */}
                <div className="mt-2">
                  <p className="text-xs text-gray-600">
                    Get your API key from:{' '}
                    {config.provider === 'openai' && (
                      <a 
                        href="https://platform.openai.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenAI Platform
                      </a>
                    )}
                    {config.provider === 'anthropic' && (
                      <a 
                        href="https://console.anthropic.com/settings/keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Anthropic Console
                      </a>
                    )}
                    {config.provider === 'google' && (
                      <a 
                        href="https://makersuite.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
