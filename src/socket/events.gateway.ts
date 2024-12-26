import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const WEBSOCKET_PORT: number = parseInt(process.env.WEBSOCKET_PORT, 10) || 6969;
const WEBSOCKET_NAMESPACE = process.env.WEBSOCKET_NAMESPACE || 'social';

@WebSocketGateway(WEBSOCKET_PORT, {
  namespace: WEBSOCKET_NAMESPACE,
  cors: {
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private logger: Logger = new Logger('WebSocket: EventsGateway');
  @WebSocketServer() server: Server; // tao server ssocket.io

  //@overwrite method OnGatewayInit
  afterInit(server: Server) {
    console.log(server, 76767);
    this.logger.log('Initialized');
  }

  //@overwrite method OnGatewayConnection
  handleConnection(client: Socket, ...args: any[]) {
    console.log(args);
    this.logger.log(`Connection Client Id: ${client.id}`);
  }

  //@overwrite method OnGatewayDisconnect
  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnect Client Id: ${client.id}`);
  }

  @SubscribeMessage('newPost')
  handleNewPost(data: any) {
    this.server.emit('newPost', data);
  }
}
