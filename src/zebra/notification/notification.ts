export interface INotification {
  class: string;
  content: string;
  duration: number;
}

export class Notification {
  private handler: (notification: INotification) => void;

  constructor(handler: (notification: INotification) => void) {
    this.handler = handler;
  }

  public notify(notification: INotification): void {
    this.handler(notification);
  }

}
