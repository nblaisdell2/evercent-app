import app from "./app";
import { createServer } from "http";
import { config } from "dotenv";

// Get port from environment and store in Express.
const myConfig = config();
if (myConfig?.parsed?.PORT) {
  process.env["PORT"] = myConfig.parsed.PORT;
}
const port = process.env.PORT || 5000;
app.set("port", port);

// Create HTTP server.
const server = createServer(app);

// Listen on provided port, on all network interfaces.
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

// Event listener for HTTP server "error" event.
function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

// Event listener for HTTP server "listening" event.
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  console.log(`Listening on ${bind}`);
}
