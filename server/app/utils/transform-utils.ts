export const removeUnderscoreId = (_doc: unknown, ret: Record<string, unknown>) => {
    delete ret['_id'];
};
