import type { BuzzerSettings } from '@/../common/gameSettings/BuzzerSettings';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import type { SimonSettings } from '@/../common/gameSettings/SimonSettings';
import type { StopwatchSettings } from '@/../common/gameSettings/StopwatchSettings';
import type { PongSettings } from '@/../common/gameSettings/PongSettings';
import type { ViewingRateSettings } from '@/../common/gameSettings/ViewingRateSettings';

export interface GameSettings {
  buzzer: BuzzerSettings;
  quiz: QuizSettings;
  simon: SimonSettings;
  stopwatch: StopwatchSettings;
  // The settings store has always produced this; the interface just never
  // named it, which left every consumer of GameSettings blind to it.
  viewingRate: ViewingRateSettings;
  pong: PongSettings;
}
