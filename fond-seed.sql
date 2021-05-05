\echo 'Ready to seed fond db?'
\prompt 'Return for yes or control-C to cancel > ' foo

\connect fond
\i recipe-seed-v2.sql

\echo 'Ready to seed fond_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

\connect fond_test
\i recipe-seed-v2.sql