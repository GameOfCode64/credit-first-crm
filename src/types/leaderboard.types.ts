export interface LeaderboardRow {
  userId: string;
  name: string;
  score: number;
  level: string;
  badges: string[];
  breakdown: {
    CALL: number;
    INTERESTED: number;
    FOLLOW_UP: number;
    WON: number;
  };
}
