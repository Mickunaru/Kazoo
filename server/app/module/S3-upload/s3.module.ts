import { BucketController } from '@app/controllers/bucket/bucket.controller';
import { FirebaseModule } from '@app/module/firebase/firebase.module';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { Logger, Module } from '@nestjs/common';

@Module({
    imports: [FirebaseModule],
    providers: [Logger, S3Service],
    controllers: [BucketController],
    exports: [S3Service],
})
export class S3Module {}
