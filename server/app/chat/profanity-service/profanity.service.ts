import { Profanity } from '@2toad/profanity';
import { Injectable } from '@nestjs/common';
import { CENSORSHIP_IGNORE_LIST, QUEBEC_BAD_WORDS } from './bad-words.const';

@Injectable()
export class ProfanityService {
    private readonly filter: Profanity;

    constructor() {
        this.filter = new Profanity({ languages: ['en', 'fr'] });
        this.filter.removeWords(CENSORSHIP_IGNORE_LIST);
        this.filter.addWords(QUEBEC_BAD_WORDS);
    }

    clean(input: string): string {
        return this.filter.censor(input);
    }
}
