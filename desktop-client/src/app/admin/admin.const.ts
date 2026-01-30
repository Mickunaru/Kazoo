import { Game } from '@common/interfaces/game';

export const EMPTY_GAME_OBJECT: Game = {
    id: '',
    isHidden: false,
    lastModification: new Date(),
    title: '',
    description: '',
    duration: 10,
    questions: [],
    private: false,
    creator: 'name',
};

export enum QuestionBankSuccessMessage {
    UPDATE = 'Question mise à jour',
    CREATION = 'Question créée',
    DELETION = 'La question a été supprimée avec succès',
}

export const DEFAULT_POINT_VALUE = 10;
