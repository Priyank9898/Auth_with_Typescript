import "dotenv/config";
import app from "./app/app.index.js";
import { requireEnv } from "./app/utils/require-env.js";

const startPoint = () => {
  const port = requireEnv("PORT");
  app.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
};

startPoint();
