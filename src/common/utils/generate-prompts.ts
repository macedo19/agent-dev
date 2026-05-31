import { AgentType, PlaceholdersAgentEntrada } from "../interfaces/agent.interface.js";
import promptAdherence from "../prompts/agent-compliance.prompt.js";
import promptReview from "../prompts/agent-review.prompt.js"

function replacePlaceholders(prompt: string, placeholder :PlaceholdersAgentEntrada) {
    console.warn(placeholder)
    const promptFormatted = prompt.replace('%code', placeholder.code)
    .replace('%language', placeholder.language || '')
    .replace('%context', placeholder.context || '')
    .replace('%task_description', placeholder.task_description || '');
    return promptFormatted;
}

const prompts: { [key: string]: (placeholdersEntrada: PlaceholdersAgentEntrada) => string } = {
    'review': (placeholdersEntrada) => replacePlaceholders(promptReview, placeholdersEntrada),
    'compliance': (placeholdersEntrada) => replacePlaceholders(promptAdherence, placeholdersEntrada)
};

function generatePrompt(type: AgentType, placeholdersEntrada: PlaceholdersAgentEntrada) {
    const promptTemplate = prompts[type];
    return promptTemplate(placeholdersEntrada);
}

export { generatePrompt }