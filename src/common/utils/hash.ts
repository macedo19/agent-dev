import { PlaceholdersAgentEntrada } from "../interfaces/agent.interface.js";
import { createHash } from "crypto";
function generateHashInput(input: PlaceholdersAgentEntrada) {
  const hash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  return hash;
}

export { generateHashInput };
