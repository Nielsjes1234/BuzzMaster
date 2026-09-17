import { BuzzerButton } from '@/plugins/buzzer/types';

/**
 * Quasar colour names for the five physical buzzer buttons. The values are
 * defined per theme in `src/css/tokens.scss`; these names only point at them.
 */
export const buzzerButtonColor: Record<BuzzerButton, string> = {
  [BuzzerButton.BLUE]: 'buzz-blue',
  [BuzzerButton.ORANGE]: 'buzz-orange',
  [BuzzerButton.GREEN]: 'buzz-green',
  [BuzzerButton.YELLOW]: 'buzz-yellow',
  [BuzzerButton.RED]: 'buzz-red',
};
