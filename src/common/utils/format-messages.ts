function formatMessageToJson(message: string) {
    const cleaned = message.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    return JSON.parse(cleaned);
}

export { formatMessageToJson }