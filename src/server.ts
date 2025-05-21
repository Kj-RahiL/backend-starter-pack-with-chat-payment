import { Server } from "http";
import app from "./app";
import config from "./config";
// import cron from "node-cron";
import { socketIo } from "./helpars/socketIo";

// Main function to start the server
function main() {
  // cron.schedule("0 * * * *", async () => {
  //   console.log("corn job updated every hour.");

  // });

  const server: Server = app.listen(Number(config.port), "10.0.10.84" ,() => {
    console.log(
      "Server is running on port ==>",
      `http://10.0.10.84:${config.port}`
    );
  });

  

  socketIo(server);  // clear this if you don't need socket.io

  // Graceful shutdown function
  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log("Server closed");
      });
    }
    process.exit(1);
  };

  // Handle uncaught exceptions and unhandled promise rejections
  process.on("uncaughtException", exitHandler);
  process.on("unhandledRejection", exitHandler);
}

// Start the server
main();

export default app;
