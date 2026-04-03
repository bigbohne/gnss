CREATE TABLE
  public.survey_points (
    id serial NOT NULL,
    "timestamp" timestamp with time zone NULL DEFAULT now(),
    name text NULL,
    tags jsonb NULL DEFAULT '{}'::jsonb,
    geom geometry (Point, 4258) NOT NULL
  );

ALTER TABLE
  public.survey_points
ADD
  CONSTRAINT survey_points_pkey PRIMARY KEY (id)

CREATE TABLE
  public.survey_lines (
    id serial NOT NULL,
    "timestamp" timestamp with time zone NULL DEFAULT now(),
    name text NULL,
    tags jsonb NULL DEFAULT '{}'::jsonb,
    geom geometry (LineString, 4258) NOT NULL
  );

ALTER TABLE
  public.survey_lines
ADD
  CONSTRAINT survey_lines_pkey PRIMARY KEY (id)


CREATE TABLE
  public.survey_polygons (
    id serial NOT NULL,
    "timestamp" timestamp with time zone NULL DEFAULT now(),
    name text NULL,
    tags jsonb NULL DEFAULT '{}'::jsonb,
    geom geometry (Polygon, 4258) NOT NULL
  );

ALTER TABLE
  public.survey_polygons
ADD
  CONSTRAINT survey_polygons_pkey PRIMARY KEY (id)