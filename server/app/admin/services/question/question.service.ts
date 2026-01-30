import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { Question } from '@app/model/database/question';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) private readonly questionModel: Model<Question>,
        private readonly userManagerService: UserManagerService,
    ) {}

    async getUrl(questionId: string): Promise<string> {
        const question = await this.questionModel.findOne({ uuid: questionId });
        if (!question) return '';

        return question.imageUrl;
    }

    async getQuestions(): Promise<Question[]> {
        return await this.questionModel.find({});
    }

    async getQuestion(id: string): Promise<Question> {
        const question = await this.questionModel.findById(id);
        if (!question) {
            throw new DocumentNotFoundError('ID for question not found');
        }
        return question;
    }

    async createQuestion(questionDto: QuestionDto, uid: string): Promise<Question> {
        await this.addUserToQuestionDto(questionDto, uid);
        try {
            return await this.questionModel.create(questionDto);
        } catch (error) {
            const MONGOOSE_DUPLICATE_KEY_ERROR = 11000;
            if (error.code === MONGOOSE_DUPLICATE_KEY_ERROR) {
                throw new BadRequestException(`Question Title Already Exists : ${questionDto.text}`);
            }
            throw new BadRequestException('Some Error while creating question');
        }
    }

    async updateQuestion(id: string, questionDto: QuestionDto): Promise<Question> {
        return await this.questionModel.findByIdAndUpdate(id, questionDto, { upsert: true, new: true });
    }

    async deleteQuestion(id: string): Promise<Question> {
        const question = await this.questionModel.findByIdAndDelete(id);
        if (!question) {
            throw new DocumentNotFoundError('ID for question not found');
        }
        return question;
    }

    async updateQuestionImage(questionId: string, newImageUrl: string) {
        await this.questionModel.updateOne({ uuid: questionId }, { $set: { imageUrl: newImageUrl } });
    }

    private async addUserToQuestionDto(questionDto: QuestionDto, uid: string) {
        const user = await this.userManagerService.getUserById(uid);
        if (!user) throw Error('User Not found');

        questionDto.creator = user.username;
    }
}
