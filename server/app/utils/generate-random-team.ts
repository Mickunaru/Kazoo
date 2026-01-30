import { paleColors, simpleShapeIcons } from '@common/constants/team-constants';

export const generateRandomTeamShapeIcons = (): string[][] => {
    const RANDOM_CONST = 0.5;
    const shapes = [...simpleShapeIcons].sort(() => Math.random() - RANDOM_CONST);
    const colors = [...paleColors].sort(() => Math.random() - RANDOM_CONST);
    return shapes.map((value, index) => [value, colors[index]]);
};
