import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    PutObjectCommandInput,
    S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Rest } from '@common/enum/rest';
import { S3Url } from '@common/interfaces/url';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
/*
 * Lint had  to be disabled since Bucket, Key and Body are
 * AWS object attributes and cant be camelCase
 */
/* eslint-disable @typescript-eslint/naming-convention */
@Injectable()
export class S3Service {
    private region: string;
    private accessKey: string;
    private secretKey: string;
    private bucketName: string;

    constructor(
        private readonly logger: Logger,
        configService: ConfigService,
    ) {
        this.region = configService.get<string>('S3_REGION') ?? '';
        this.accessKey = configService.get<string>('S3_ACCESS_KEY') ?? '';
        this.secretKey = configService.get<string>('S3_SECRET_KEY') ?? '';
        this.bucketName = configService.get<string>('S3_BUCKET_NAME') ?? '';
        if (this.region === '' || this.accessKey === '' || this.secretKey === '' || this.bucketName === '')
            throw new Error(
                `S3 Config is null: region: ${this.region} accessKey: ${this.accessKey} secretKey: ${this.secretKey} bucketName: ${this.bucketName}`,
            );
    }

    get client() {
        return new S3Client({
            region: this.region,
            apiVersion: 'latest',
            credentials: {
                accessKeyId: this.accessKey,
                secretAccessKey: this.secretKey,
            },
        });
    }

    async uploadAudioFile(file: Express.Multer.File): Promise<S3Url> {
        const fileName = `${uuidv4()}.mp3`;
        const filePath = `audio/${fileName}`;
        const fileStream = file.buffer;
        const uploadParams: PutObjectCommandInput = {
            Bucket: this.bucketName,
            Key: filePath,
            Body: fileStream,
            ContentType: 'audio',
            ACL: 'public-read',
        };
        return this.client
            .send(new PutObjectCommand(uploadParams))
            .then(() => {
                this.logger.log('File uploaded successfully', 'S3');
                return {
                    url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filePath}`,
                };
            })
            .catch((error) => {
                this.logger.error('Error uploading file', error);
                throw new Error('Error uploading file');
            });
    }

    async deleteAudioFile(fileName: string): Promise<void> {
        const filePath = `audio/${fileName}`;
        const deleteParams = {
            Bucket: this.bucketName,
            Key: filePath,
        };
        return this.client
            .send(new DeleteObjectCommand(deleteParams))
            .then(() => {
                this.logger.log('File deleted successfully', 'S3');
            })
            .catch((error) => {
                this.logger.error('Error deleting file', error);
                throw new Error('Error deleting file');
            });
    }

    /**
     * returns a signed URL
     *
     * @param operation - the operation to be made in AWS ('put', 'delete', 'get')
     * @param key - should be the name of the file to store the image in
     * MUST ABSOLUTELY END WITH .png
     * @returns a Promise
     *
     */
    async getSignedUrl(operation: string, key: string): Promise<S3Url> {
        let command;
        switch (operation) {
            case Rest.put:
                command = new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    ContentType: 'image/png',
                    ACL: 'public-read',
                });
                break;
            case Rest.delete:
                command = new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                });
                break;
            case Rest.get:
                command = new GetObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                });
                break;
            default:
                throw new Error('Unsupported operation for signed URL');
        }
        const url = await getSignedUrl(this.client, command, { expiresIn: 30 });
        this.logger.log('signed obtained');
        return { url };
    }

    // folderKey should follow this pattern: "{folderName}/"
    async emptyFolder(folderKey: string) {
        if (!folderKey) return;

        let continuationToken: string | undefined;

        try {
            do {
                const listCommand = new ListObjectsV2Command({
                    Bucket: this.bucketName,
                    Prefix: folderKey,
                    ContinuationToken: continuationToken,
                });

                const { Contents, IsTruncated, NextContinuationToken } = await this.client.send(listCommand);

                if (!Contents || !Contents.length) break;

                const deleteCommand = new DeleteObjectsCommand({
                    Bucket: this.bucketName,
                    Delete: {
                        Objects: Contents.map((item) => ({ Key: item.Key })),
                        Quiet: true,
                    },
                });

                await this.client.send(deleteCommand);

                continuationToken = IsTruncated ? NextContinuationToken : undefined;
            } while (continuationToken);
        } catch (error) {
            this.logger.error('Error emptying folder on room destroyed', error, 'S3');
        }
    }

    async putImage(uuid: string, file: Express.Multer.File, path?: string): Promise<S3Url> {
        const fileName = `${uuid}.png`;
        const filePath = path ? `${path}/${fileName}` : fileName;
        const fileStream = file.buffer;
        const uploadParams: PutObjectCommandInput = {
            Bucket: this.bucketName,
            Key: filePath,
            Body: fileStream,
            ContentType: 'png',
            ACL: 'public-read',
        };

        try {
            await this.client.send(new PutObjectCommand(uploadParams));

            this.logger.log(`File ${fileName} uploaded successfully`, 'S3');
            return { url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filePath}` };
        } catch (error) {
            this.logger.error(`Error deleting file ${fileName}`, error);
            throw new Error(`Error deleting file ${fileName}`);
        }
    }

    // eslint-disable-next-line no-unused-vars
    async deleteQuestionImage(fileName: string, path?: string): Promise<void> {
        // const filePath = path ? `${path}/${fileName}` : fileName;
        // const deleteParams = {
        //     Bucket: this.bucketName,
        //     Key: filePath,
        // };

        // try {
        //     await this.client.send(new DeleteObjectCommand(deleteParams));
        //     this.logger.log(`File '${fileName}' deleted successfully`, 'S3');
        // } catch (error) {
        //     this.logger.error(`Error deleting file ${fileName}`, error, 'S3');
        // }
        this.logger.warn('Image should be deleted');
    }
}
