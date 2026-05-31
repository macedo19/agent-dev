#!/bin/bash

echo "Iniciando ollama server...."
ollama serve &
ollama signin

echo "Aguardando ollama server ficar pronto..."
until ollama list > /dev/null 2>&1; do
  sleep 1
done

echo "Ollama server está pronto! Baixando modelos..."
# ollama pull kimi-k2.6:cloud
# ollama pull mistral-medium-3.5
# ollama pull qwen2.5-coder:7b
# ollama pull qwen3-coder-next


echo "Modelos prontos. Mantendo servidor em execução..."
wait
