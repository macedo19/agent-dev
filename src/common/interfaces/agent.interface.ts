type AgentType = "review" | "compliance"

interface PlaceholdersAgentEntrada {
    code: string,
    language?: string
    context?:string
    task_description?: string,
}

export { AgentType , PlaceholdersAgentEntrada}