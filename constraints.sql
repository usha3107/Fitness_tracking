
-- Gym Capacity Check
ALTER TABLE "gyms" ADD CONSTRAINT "check_gym_capacity_positive" CHECK (capacity > 0);

-- Metric Heart Rate Bounds
ALTER TABLE "metrics" ADD CONSTRAINT "check_heart_rate_bounds" CHECK (
  type <> 'heart_rate' OR (value >= 30 AND value <= 220)
);

-- Semantic JSONB validation for Exercises
-- CASE 1: Strength must have reps, sets.
-- CASE 2: Cardio must have duration.
ALTER TABLE "exercises" ADD CONSTRAINT "check_exercise_data_schema" CHECK (
  (type = 'strength' AND (data->>'reps' IS NOT NULL AND data->>'sets' IS NOT NULL)) OR
  (type = 'cardio' AND (data->>'duration' IS NOT NULL)) OR
  (type NOT IN ('strength', 'cardio')) -- Allow other types or strict? Requirement only mentions these polymorphic types logic.
);
