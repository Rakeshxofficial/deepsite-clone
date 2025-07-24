import { NextRequest, NextResponse } from "next/server";
import { AIService, AI_PROVIDERS } from "@/lib/ai-providers";
import {
  INITIAL_SYSTEM_PROMPT,
  FOLLOW_UP_SYSTEM_PROMPT,
  SEARCH_START,
  DIVIDER,
  REPLACE_END,
} from "@/lib/prompts";

// Environment variables for API keys
const getApiKey = (provider: string): string | null => {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY || null;
    case 'deepseek':
      return process.env.DEEPSEEK_API_KEY || null;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || null;
    case 'groq':
      return process.env.GROQ_API_KEY || null;
    case 'together':
      return process.env.TOGETHER_API_KEY || null;
    default:
      return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, provider = 'openai', model, html, redesignMarkdown } = body;

    if (!prompt && !redesignMarkdown) {
      return NextResponse.json(
        { ok: false, error: "Missing prompt or redesign content" },
        { status: 400 }
      );
    }

    // Get API key for the provider
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      return NextResponse.json(
        { 
          ok: false, 
          error: `API key not configured for ${provider}. Please set the environment variable.`,
          missingKey: true 
        },
        { status: 400 }
      );
    }

    // Validate provider and model
    const providerConfig = AI_PROVIDERS[provider];
    if (!providerConfig) {
      return NextResponse.json(
        { ok: false, error: "Invalid provider" },
        { status: 400 }
      );
    }

    const selectedModel = model || providerConfig.models[0];
    if (!providerConfig.models.includes(selectedModel)) {
      return NextResponse.json(
        { ok: false, error: "Invalid model for selected provider" },
        { status: 400 }
      );
    }

    // Initialize AI service
    const aiService = new AIService(provider, apiKey);

    // Prepare messages
    const messages = [
      {
        role: 'system' as const,
        content: INITIAL_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: redesignMarkdown
          ? `Here is my current design as a markdown:\n\n${redesignMarkdown}\n\nNow, please create a new design based on this markdown.`
          : html
          ? `Here is my current HTML code:\n\n\`\`\`html\n${html}\n\`\`\`\n\nNow, please modify it based on this request: ${prompt}`
          : prompt,
      },
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the response
    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    // Process streaming response
    (async () => {
      try {
        const streamResponse = await aiService.streamChatCompletion({
          model: selectedModel,
          messages,
          max_tokens: 4000,
          temperature: 0.7,
          stream: true,
        });

        const reader = streamResponse.getReader();
        const decoder = new TextDecoder();
        let completeResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  completeResponse += content;
                  await writer.write(encoder.encode(content));

                  // Stop if we have a complete HTML document
                  if (completeResponse.includes('</html>')) {
                    break;
                  }
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }

          if (completeResponse.includes('</html>')) {
            break;
          }
        }
      } catch (error: any) {
        await writer.write(
          encoder.encode(
            JSON.stringify({
              ok: false,
              error: error.message || "An error occurred while processing your request.",
            })
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, html, provider = 'openai', model, selectedElementHtml } = body;

    if (!prompt || !html) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get API key for the provider
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      return NextResponse.json(
        { 
          ok: false, 
          error: `API key not configured for ${provider}. Please set the environment variable.`,
          missingKey: true 
        },
        { status: 400 }
      );
    }

    // Validate provider and model
    const providerConfig = AI_PROVIDERS[provider];
    if (!providerConfig) {
      return NextResponse.json(
        { ok: false, error: "Invalid provider" },
        { status: 400 }
      );
    }

    const selectedModel = model || providerConfig.models[0];

    // Initialize AI service
    const aiService = new AIService(provider, apiKey);

    // Prepare messages for diff-patch update
    const messages = [
      {
        role: 'system' as const,
        content: FOLLOW_UP_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: "You are modifying the HTML file based on the user's request.",
      },
      {
        role: 'assistant' as const,
        content: `The current code is: \n\`\`\`html\n${html}\n\`\`\` ${
          selectedElementHtml
            ? `\n\nYou have to update ONLY the following element, NOTHING ELSE: \n\n\`\`\`html\n${selectedElementHtml}\n\`\`\``
            : ""
        }`,
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const response = await aiService.chatCompletion({
      model: selectedModel,
      messages,
      max_tokens: 2000,
      temperature: 0.3,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { ok: false, error: errorData.error?.message || "API request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { ok: false, error: "No content returned from the model" },
        { status: 400 }
      );
    }

    // Process diff-patch format
    const updatedLines: number[][] = [];
    let newHtml = html;
    let position = 0;
    let moreBlocks = true;

    while (moreBlocks) {
      const searchStartIndex = content.indexOf(SEARCH_START, position);
      if (searchStartIndex === -1) {
        moreBlocks = false;
        continue;
      }

      const dividerIndex = content.indexOf(DIVIDER, searchStartIndex);
      if (dividerIndex === -1) {
        moreBlocks = false;
        continue;
      }

      const replaceEndIndex = content.indexOf(REPLACE_END, dividerIndex);
      if (replaceEndIndex === -1) {
        moreBlocks = false;
        continue;
      }

      const searchBlock = content.substring(
        searchStartIndex + SEARCH_START.length,
        dividerIndex
      );
      const replaceBlock = content.substring(
        dividerIndex + DIVIDER.length,
        replaceEndIndex
      );

      if (searchBlock.trim() === "") {
        newHtml = `${replaceBlock}\n${newHtml}`;
        updatedLines.push([1, replaceBlock.split("\n").length]);
      } else {
        const blockPosition = newHtml.indexOf(searchBlock);
        if (blockPosition !== -1) {
          const beforeText = newHtml.substring(0, blockPosition);
          const startLineNumber = beforeText.split("\n").length;
          const replaceLines = replaceBlock.split("\n").length;
          const endLineNumber = startLineNumber + replaceLines - 1;

          updatedLines.push([startLineNumber, endLineNumber]);
          newHtml = newHtml.replace(searchBlock, replaceBlock);
        }
      }

      position = replaceEndIndex + REPLACE_END.length;
    }

    return NextResponse.json({
      ok: true,
      html: newHtml,
      updatedLines,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}