import { FireBaseAuthGuard, principal } from '@app/guards/firebase-auth-guard';
import { User } from '@app/model/database/user';
import { UserDto } from '@app/model/dto/user/user.dto';
import { ConnectionService } from '@app/services/connection/connection.service';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import {
    AVATAR_ENDPOINT,
    CUSTOM_AVATAR_ENDPOINT,
    FCM_TOKEN_ENDPOINT,
    IS_SIGNED_IN_ENDPOINT,
    USERNAME_ENDPOINT,
    USERS_ENDPOINT,
} from '@common/constants/endpoint-constants';
import { S3Url } from '@common/interfaces/url';
import { Body, Controller, Get, NotFoundException, Param, Post, Put, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('User-manager')
@Controller(USERS_ENDPOINT)
export class UserManagerController {
    constructor(
        private readonly userManagerService: UserManagerService,
        private readonly connectionService: ConnectionService,
    ) {}

    @ApiCreatedResponse({ description: 'Creates new user', type: User })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST http status when id is invalid MongoDB ID' })
    @Post()
    async createUser(@Body() userDto: UserDto) {
        try {
            return await this.userManagerService.createUser(userDto);
        } catch (error) {
            throw new UnauthorizedException((error as Error).message);
        }
    }

    @ApiOperation({ summary: "Gets a user's profile data by username" })
    @ApiOkResponse({ description: "Gets a user's profile data by username", type: User })
    @ApiNotFoundResponse({ description: 'Return NOT_FOUND http status when request fails' })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST http status when ID is invalid MongoDB ID' })
    @Get(`${USERNAME_ENDPOINT}/:username`)
    async getUserByName(@Param('username') username: string) {
        try {
            return await this.userManagerService.getUserByUsername(username);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Get(`${IS_SIGNED_IN_ENDPOINT}/:username`)
    async isUserSignedIn(@Param('username') username: string) {
        try {
            return this.connectionService.isSignedIn(username);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
    @UseGuards(FireBaseAuthGuard)
    @Put(`${AVATAR_ENDPOINT}/:id`)
    async changeAvatar(@Param('id') id: string, @principal() uid: string): Promise<S3Url> {
        return { url: await this.userManagerService.updateAvatar(uid, id) };
    }
    @UseGuards(FireBaseAuthGuard)
    @Put(CUSTOM_AVATAR_ENDPOINT)
    async updateWithCustomAvatar(@principal() uid: string): Promise<S3Url> {
        return { url: await this.userManagerService.updateWithCustomAvatar(uid) };
    }

    @UseGuards(FireBaseAuthGuard)
    @Put(FCM_TOKEN_ENDPOINT)
    async updateFcmToken(@Body('fcmToken') fcmToken: string, @principal() uid: string): Promise<void> {
        await this.userManagerService.updateFcmToken(uid, fcmToken);
    }

    @ApiOkResponse({ description: 'Updates user profile', type: User })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST http status when id is invalid MongoDB ID' })
    @Put(':uid')
    async updateUser(@Param('uid') uid: string, @Body() userDto: UserDto) {
        await this.userManagerService.updateUser(uid, userDto);
    }
}
