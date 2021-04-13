\echo 'Delete and recreate fond db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS fond;
CREATE DATABASE fond;
\connect fond
\i fond-schema.sql

\echo 'Delete and recreate fond_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS fond_test ;
CREATE DATABASE fond_test;
\connect fond_test

\i fond-schema.sql