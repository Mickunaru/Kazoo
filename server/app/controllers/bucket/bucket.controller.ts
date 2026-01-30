import { FireBaseAuthGuard } from '@app/guards/firebase-auth-guard';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { BUCKET_ENDPOINT } from '@common/constants/endpoint-constants';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';

@Controller(BUCKET_ENDPOINT)
export class BucketController {
    constructor(private readonly s3Service: S3Service) {}

    @Get(':operation/:key(*)')
    @UseGuards(FireBaseAuthGuard)
    async getSignedUrl(@Param('operation') operation: string, @Param('key') key: string) {
        return await this.s3Service.getSignedUrl(operation, key);
    }
}
