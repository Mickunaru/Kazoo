import { ID_MOCK } from '@app/constants/test-utils';
import { removeUnderscoreId } from './transform-utils';

describe('Transform Utils', () => {
    it('should delete _id field', () => {
        const record = { _id: ID_MOCK } as Record<string, unknown>;
        removeUnderscoreId({}, record);
        expect(record['_id']).toBe(undefined);
    });
});
