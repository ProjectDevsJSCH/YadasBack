import { MESSAGES } from './enums/messages-response.enum';

export class Response {
    constructor(
        private message: MESSAGES,
        private error?: string,
    ) {

    }

    setError(error: string): Response {
        this.error = error;

        return this;
    }
}
