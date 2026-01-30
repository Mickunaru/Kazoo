import { HttpErrorResponse } from '@angular/common/http';
import { SERVER_DOWN } from '@app/constants/error-message';

export class Errors {
    static throwServerIsDown(error: HttpErrorResponse) {
        if (error.status === 0) throw new Error(SERVER_DOWN);
    }
}
