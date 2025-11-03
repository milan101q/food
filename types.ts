export enum AppState {
  SELECTING_LANGUAGE,
  IDLE,
  ANALYZING_IMAGE,
  SUGGESTIONS_READY,
  RECIPE_READY,
  GENERATING_IMAGE,
  IMAGE_READY,
  COOKING,
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  calories?: number;
}