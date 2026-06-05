#!/bin/bash

echo "🚀 Iniciando ollama server...."
ollama serve &
ollama signin

echo "Aguardando ollama server ficar pronto..."
until ollama list > /dev/null 2>&1; do
  sleep 1
done

echo "✅ Ollama server está pronto!"
echo "📥 Baixando modelos..."

# ollama pull qwen3-coder-next
# ollama pull gemma4:e4b


echo "✅ Modelos locais prontos. Mantendo servidor em execução..."
wait
