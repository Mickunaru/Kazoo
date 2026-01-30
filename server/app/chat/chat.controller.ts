import { S3Service } from '@app/services/s3-upload/s3.service';
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chat')
export class ChatController {
    constructor(private readonly s3Service: S3Service) {}

    @Post()
    @UseInterceptors(FileInterceptor('audio'))
    async uploadAudio(@UploadedFile() file: Express.Multer.File) {
        try {
            // Delegate the upload logic to the uploadService
            const result = await this.s3Service.uploadAudioFile(file);

            return {
                message: 'Audio uploaded successfully to S3',
                fileUrl: result.url, // URL returned from the upload service
            };
        } catch (error) {
            // Handle errors gracefully
            throw new Error(`Failed to upload audio: ${error.message}`);
        }
    }
}
