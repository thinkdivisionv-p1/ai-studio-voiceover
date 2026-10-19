export type VisualType = 'kinetic-text' | 'data-chart' | 'infrastructure-diagram' | 'flow-pipeline' | 'market-comparison';

export interface SceneBeat {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  title: string;
  headline: string;
  subheadline: string;
  visualType: VisualType;
  accentText?: string;
  metric?: {
    value: string;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
    change?: string;
  };
  chartData?: {
    type: 'bar' | 'line';
    labels: string[];
    values: number[];
    unit?: string;
  };
  flowNodes?: {
    title: string;
    detail: string;
    status?: 'active' | 'bottleneck' | 'solution';
  }[];
  captionText: string;
  storyPhase: 'Hook' | 'Engineering Problem' | 'Unmet Need' | 'Business Opportunity' | 'Practical Solution' | 'Conclusion';
}

export interface VideoProject {
  id: string;
  title: string;
  channelName: string;
  episodeNumber: string;
  topic: string;
  totalDuration: number; // in seconds
  voiceoverAudioBase64?: string;
  voiceoverAudioUrl?: string;
  bgMusicEnabled: boolean;
  bgMusicVolume: number;
  scenes: SceneBeat[];
  thumbnail: {
    title: string;
    highlightWord: string;
    metricBadge: string;
    subjectTag: string;
  };
}

export interface QCReport {
  overallScore: number; // 0 - 100
  totalDuration: number;
  longestStaticDuration: number; // in seconds (must be <= 6s)
  sceneCount: number;
  averageSceneDuration: number;
  wordsPerMinute: number;
  pacingStatus: 'Optimal' | 'Too Fast' | 'Too Slow';
  retentionAlerts: {
    timestamp: number;
    severity: 'warning' | 'info' | 'pass';
    message: string;
  }[];
  dataVerificationNotes: string[];
}
