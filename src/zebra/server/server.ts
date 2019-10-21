import * as cors from 'cors';
import * as express from 'express';
import { Server as httpServer } from 'http';
import { Manager } from '../manager';

/**
 * POST request interface.
 */
interface IRequest {
  printer: number;
  data: string;
}

export class Server {

  private express: express.Express = express();
  private server: httpServer;
  private manager: Manager;

  constructor(manager: Manager, port: number = 9669) {

    this.manager = manager;

    // Enable CORS
    this.express.use(cors());

    // Use Raw Parser
    this.express.use(express.raw({
      inflate: true,
      limit: '100kb',
      type: 'x-application/zpl'
    }));

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
    this.express.get('/', (_, response) => {
      this.manager.deviceList
        .then((devices) => {
          const index = this.manager.findDefaultDeviceIndex(devices);
          response.json({
              selected: index,
              devices,
          });
        })
        .catch((error) => response.status(500).send(error.toString()));
    });

    // Handle the POST request.
    this.express.post('/', (request, response) => {

      const contype = request.headers['content-type'];
      if (contype !== 'x-application/zpl') return response.status(400).send('Bad request');


      if (request.body.length > 0) {

        let printer = request.headers['x-printer'] ?  parseInt(request.headers['x-printer'].toString(), 10) : undefined;
        if (isNaN(printer)) printer = undefined;
        
        this.manager.transfer(request.body, printer)
          .then(() => {
            response.end();
          })
          .catch((error) => {
            response.status(500).send(error.toString());
          });

        return;
      }

      // If any condition is not met return Bad Bad Request.
      response.status(400).end();

    });
  }

}
