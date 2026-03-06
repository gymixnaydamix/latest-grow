-- Add geospatial coordinates for school location maps
ALTER TABLE "School"
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION;
