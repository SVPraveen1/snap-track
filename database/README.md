# Database Structure

This directory contains all database-related files for the SnapTrack application.

## Directory Structure

```
database/
├── schema/
│   ├── tables.sql     # Table definitions
│   ├── security.sql   # RLS policies and security settings
│   └── triggers.sql   # Database triggers
├── queries/
│   ├── user_health.sql    # User health-related queries
│   ├── weekly_plans.sql   # Weekly plan-related queries
│   └── food_entries.sql   # Food entry-related queries
└── README.md
```

## Tables

1. **user_health**
   - Stores user health information
   - Contains age, weight, height, gender, activity level, and goals

2. **weekly_plans**
   - Stores generated workout and nutrition plans
   - Uses JSONB for flexible plan storage

3. **food_entries**
   - Stores user's food entries
   - Includes food name, nutritional data, and consumption time

## Security

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- CRUD operations are restricted to the owner of the data

## Queries

Organized by feature:
- User health operations
- Weekly plan operations
- Food entry operations

Each query file contains commonly used operations for its respective feature.

## Usage

1. Execute schema files in the following order:
   ```bash
   psql -f schema/tables.sql
   psql -f schema/security.sql
   psql -f schema/triggers.sql
   ```

2. Use the queries in the queries directory as templates for your database operations. 