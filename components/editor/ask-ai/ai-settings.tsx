import classNames from "classnames";
import { PiGearSixFill } from "react-icons/pi";
import { RiCheckboxCircleFill } from "react-icons/ri";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";

export function AISettings({
  open,
  onClose,
  provider,
  model,
  error,
  onChange,
  onModelChange,
}: {
  open: boolean;
  provider: string;
  model: string;
  error?: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  onChange: (provider: string) => void;
  onModelChange: (model: string) => void;
}) {
  const availableModels = useMemo(() => {
    const providerConfig = AI_PROVIDERS[provider];
    return providerConfig ? providerConfig.models : [];
  }, [provider]);

  return (
    <div className="">
      <Popover open={open} onOpenChange={onClose}>
        <PopoverTrigger asChild>
          <Button variant="black" size="sm">
            <PiGearSixFill className="size-4" />
            AI Settings
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="!rounded-2xl p-0 !w-96 overflow-hidden !bg-neutral-900"
          align="center"
        >
          <header className="flex items-center justify-center text-sm px-4 py-3 border-b gap-2 bg-neutral-950 border-neutral-800 font-semibold text-neutral-200">
            AI Provider Settings
          </header>
          <main className="px-4 pt-5 pb-6 space-y-5">
            {error && (
              <p className="text-red-500 text-sm font-medium mb-2 flex items-center justify-between bg-red-500/10 p-2 rounded-md">
                {error}
              </p>
            )}
            
            <label className="block">
              <p className="text-neutral-300 text-sm mb-2.5">Choose AI Provider</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(AI_PROVIDERS).map((providerConfig) => (
                  <Button
                    key={providerConfig.id}
                    variant={providerConfig.id === provider ? "default" : "secondary"}
                    size="sm"
                    onClick={() => {
                      onChange(providerConfig.id);
                      // Set first model of the provider as default
                      onModelChange(providerConfig.models[0]);
                    }}
                  >
                    {providerConfig.name}
                    {providerConfig.id === provider && (
                      <RiCheckboxCircleFill className="ml-2 size-4 text-blue-500" />
                    )}
                  </Button>
                ))}
              </div>
            </label>

            <label className="block">
              <p className="text-neutral-300 text-sm mb-2.5">Choose Model</p>
              <Select value={model} onValueChange={onModelChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available models</SelectLabel>
                    {availableModels.map((modelName) => (
                      <SelectItem key={modelName} value={modelName}>
                        {modelName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>

            <div className="bg-blue-500/10 border-blue-500/20 p-3 text-xs text-blue-400 border rounded-lg">
              <p className="font-semibold mb-1">API Key Required</p>
              <p>Make sure to set the environment variable for your selected provider:</p>
              <ul className="mt-2 space-y-1">
                <li>• OpenAI: <code>OPENAI_API_KEY</code></li>
                <li>• DeepSeek: <code>DEEPSEEK_API_KEY</code></li>
                <li>• Anthropic: <code>ANTHROPIC_API_KEY</code></li>
                <li>• Groq: <code>GROQ_API_KEY</code></li>
                <li>• Together: <code>TOGETHER_API_KEY</code></li>
              </ul>
            </div>
          </main>
        </PopoverContent>
      </Popover>
    </div>
  );
}