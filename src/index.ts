import express from "express";
import agentRouter from "./routes/agents.router.js"


const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.use('/api/v1', agentRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
