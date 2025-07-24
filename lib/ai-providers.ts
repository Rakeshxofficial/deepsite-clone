export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  apiKey?: string;
  baseURL?: string;
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    baseURL: 'https://api.openai.com/v1',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-coder'],
    baseURL: 'https://api.deepseek.com/v1',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    baseURL: 'https://api.anthropic.com/v1',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
    baseURL: 'https://api.groq.com/openai/v1',
  },
  together: {
    id: 'together',
    name: 'Together AI',
    models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
    baseURL: 'https://api.together.xyz/v1',
  }
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export class AIService {
  private provider: AIProvider;
  private apiKey: string;

  constructor(providerId: string, apiKey: string) {
    this.provider = AI_PROVIDERS[providerId];
    if (!this.provider) {
      throw new Error(`Provider ${providerId} not found`);
    }
    this.apiKey = apiKey;
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Set authorization header based on provider
    if (this.provider.id === 'anthropic') {
      headers['x-api-key'] = this.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Transform request for Anthropic
    let body: any = request;
    if (this.provider.id === 'anthropic') {
      body = {
        model: request.model,
        max_tokens: request.max_tokens || 4000,
        messages: request.messages.filter(m => m.role !== 'system'),
        system: request.messages.find(m => m.role === 'system')?.content,
        stream: request.stream || false,
      };
    }

    const response = await fetch(`${this.provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return response;
  }

  async streamChatCompletion(request: ChatCompletionRequest): Promise<ReadableStream> {
    const response = await this.chatCompletion({ ...request, stream: true });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.body!;
  }
}