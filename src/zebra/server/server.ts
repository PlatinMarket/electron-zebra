import * as express from 'express';
import { Server as httpServer } from 'http';

export class Server {

  private express: express.Express = express();
  private server: httpServer;

  constructor(port: number = 9669) {
    // Use JSON body parser.
    this.express.use(express.json());

    // Register handlers.
    this.register();

    // Start the server.
    this.start(port);
  }

  /**
   * Change the serving port on the fly.
   * @param port Port.
   */
  public changePort(port: number): void {
    this.server.close();
    this.start(port);
  }

  /**
   * Start the server.
   * @param port Port.
   */
  private start(port: number): void {
    this.server = this.express.listen(port, () => console.log(`Started to listening on ${port}`));
  }

  /**
   * Register the handlers.
   */
  private register(): void {

    // Handle the GET request.
    this.express.get('/', (request, response) => {
      console.log(request);
      response.send('Hi!');
    });

    // Handle the POST request.
    this.express.post('/', (request, response) => {
      console.log(request);
      response.send('Hi!');
    });
  }

}
