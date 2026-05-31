type AgentType = "review" | "compliance" | "documentation"

interface PlaceholdersAgentEntrada {
    code: string,
    language?: string
    context?:string
    task_description?: string,
    doc_type?: string,
}

export { AgentType , PlaceholdersAgentEntrada}