import { QuestionService } from '@app/admin/services/question/question.service';
import { FireBaseAuthGuard, principal } from '@app/guards/firebase-auth-guard';
import { Question } from '@app/model/database/question';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { mongoIdParam } from '@app/validation-pipes/validate-mongo-id-pipe';
import { QUESTIONS_ENDPOINT } from '@common/constants/endpoint-constants';
import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('questions')
@Controller(QUESTIONS_ENDPOINT)
@UseGuards(FireBaseAuthGuard)
export class QuestionLibraryController {
    constructor(
        private readonly questionService: QuestionService,
        private readonly s3Service: S3Service,
    ) {}

    @Put('images/:questionId')
    @UseInterceptors(FileInterceptor('file'))
    async uploadQuestionImage(@UploadedFile() file: Express.Multer.File, @Param('questionId') questionId: string) {
        const { url } = await this.s3Service.putImage(questionId, file, 'games');
        this.questionService.updateQuestionImage(questionId, url);
    }

    @Delete('images/:questionId')
    async deleteQuestionImage(@Param('questionId') questionId: string) {
        await this.s3Service.deleteQuestionImage(`${questionId}.png`, 'games');
        await this.questionService.updateQuestionImage(questionId, '');
    }

    @ApiOkResponse({ description: 'Gets all questions', type: Question, isArray: true })
    @Get()
    async getQuestions() {
        return await this.questionService.getQuestions();
    }

    @ApiOkResponse({ description: 'Gets question by ID', type: Question })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST HTTP status when ID is invalid MongoDB ID' })
    @ApiNotFoundResponse({ description: 'Return NOT_FOUND HTTP status when Question Id not found' })
    @Get(':id')
    async getQuestion(@mongoIdParam() id: string) {
        try {
            return await this.questionService.getQuestion(id);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @ApiCreatedResponse({ description: 'Creates new question', type: Question })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST HTTP status when id is invalid MongoDB ID' })
    @Post()
    async createQuestion(@Body() questionDto: QuestionDto, @principal() uid: string) {
        return await this.questionService.createQuestion(questionDto, uid);
    }

    @ApiCreatedResponse({ description: 'Updates new question or creates new one if does not exist', type: Question })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST HTTP status when id is invalid MongoDB ID' })
    @Put(':id')
    async updateQuestion(@mongoIdParam() id: string, @Body() questionDto: QuestionDto) {
        return await this.questionService.updateQuestion(id, questionDto);
    }

    @ApiOkResponse({ description: 'Deletes a question', type: Question })
    @ApiNotFoundResponse({ description: 'Return BAD_REQUEST HTTP status when id is invalid MongoDB ID' })
    @ApiNotFoundResponse({ description: 'Return NOT_FOUND HTTP status when Question Id not found' })
    @Delete(':id')
    async deleteQuestion(@mongoIdParam() id: string) {
        try {
            return await this.questionService.deleteQuestion(id);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
}
