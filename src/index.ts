import { createServer } from "node:http";
import { createExpressApplication } from "./app/app.index.js";

const main = async () => {
  try {
    const server = createServer(createExpressApplication());
    const port: number = 8080;
    server.listen(port, () => {
      console.log(`Server is running on ${port} port`);
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

main();
