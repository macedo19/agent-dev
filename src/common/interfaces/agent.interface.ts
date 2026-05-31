type AgentType = "review" | "compliance" | "documentation" | "test"

interface PlaceholdersAgentEntrada {
    code: string,
    language?: string
    context?:string
    task_description?: string,
    doc_type?: string,
    test_framework?: string
}

export { AgentType , PlaceholdersAgentEntrada}