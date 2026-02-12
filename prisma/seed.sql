
-- Create a default gym
INSERT INTO "gyms" ("id", "name", "capacity", "address")
VALUES ('default-gym', 'Main Street Gym', 100, '{"street": "123 Main St", "city": "Cityville", "country": "Countryland"}')
ON CONFLICT ("name") DO NOTHING;

-- Create a trainer
INSERT INTO "trainers" ("id", "name", "certification", "certificationExpiry")
VALUES ('default-trainer', 'John Doe', 'NSCA-CPT', '2030-01-01T00:00:00.000Z')
ON CONFLICT DO NOTHING;

INSERT INTO "members" ("id", "name", "email", "gymId", "membershipTier")
VALUES ('default-member', 'Jane Doe', 'jane@example.com', 'default-gym', 'Silver')
ON CONFLICT DO NOTHING;

INSERT INTO "sessions" ("id", "memberId", "date")
VALUES ('default-session', 'default-member', NOW())
ON CONFLICT DO NOTHING;
