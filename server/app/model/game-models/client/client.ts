export abstract class Client {
    constructor(
        public socketId: string,
        public name: string,
    ) {}
}
