import { createServer } from "../server/index";

// Export the Express app to be used as a serverless function on Vercel
const app = createServer();
export default app;
