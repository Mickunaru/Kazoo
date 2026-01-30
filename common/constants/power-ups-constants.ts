import { PowerUpType } from '@common/enum/power-up-type';

export const POWER_UP_IMAGE_URL: Record<PowerUpType, string> = {
    [PowerUpType.TRICHEUR]: 'https://kazooteam.s3.ca-central-1.amazonaws.com/images/power_ups/cheating_kazoo.webp',
    [PowerUpType.VITESSE]: 'https://kazooteam.s3.ca-central-1.amazonaws.com/images/power_ups/speed_kazoo.webp',
    [PowerUpType.CONFUSION]: 'https://kazooteam.s3.ca-central-1.amazonaws.com/images/power_ups/confused_kazoo.webp',
    [PowerUpType.SURGE]: 'https://kazooteam.s3.ca-central-1.amazonaws.com/images/power_ups/surge.png',
    [PowerUpType.TORNADE]: 'https://kazooteam.s3.ca-central-1.amazonaws.com/images/power_ups/tornade.png',
};

export const POWER_UP_DESCRIPTION = {
    tricheur: 'Supprimer un choix de réponse "faux" dans la prochaine question à choix multiples.',
    vitesse: 'Réduire le temps à la question suivante à 3 secondes pour tous lorsque votre réponse est soumise.',
    confusion: 'Masquer une lettre sur deux de la question suivante et ses choix pour les autres joueurs.',
    surge: 'Spammer les autres joueurs de fenêtres surgissantes à la prochaine question.',
    tornade: 'Mélanger aléatoirement continuellement les choix de réponses des autres joueurs à la prochaine question.',
};
export const SUCCESS_RESPONSE = 'success';
