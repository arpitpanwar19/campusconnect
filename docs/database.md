# Database Schema & Architecture

The Campus Event Platform uses PostgreSQL hosted on Supabase. We interact with it using async SQLAlchemy (`asyncpg`) from the FastAPI backend.

## Entity-Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string full_name
        string avatar_url
        string role "student, organizer, admin"
        string major
        int graduation_year
        jsonb interests
        timestamp created_at
    }

    ORGANIZATIONS {
        uuid id PK
        string name
        string slug UK
        string description
        string logo_url
        string status "pending, active, rejected"
        timestamp created_at
    }

    ORG_MEMBERS {
        uuid org_id PK, FK
        uuid user_id PK, FK
        string role "member, admin"
        timestamp created_at
    }

    EVENTS {
        uuid id PK
        uuid org_id FK
        string title
        string slug UK
        text description
        timestamp start_time
        timestamp end_time
        string location
        string category
        jsonb tags
        int capacity
        string status "draft, published, cancelled"
        timestamp created_at
    }

    REGISTRATIONS {
        uuid user_id PK, FK
        uuid event_id PK, FK
        string status "registered, waitlisted, cancelled"
        timestamp created_at
    }

    BOOKMARKS {
        uuid user_id PK, FK
        uuid event_id PK, FK
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        string message
        jsonb data
        boolean is_read
        timestamp created_at
    }

    USERS ||--o{ ORG_MEMBERS : "is member of"
    ORGANIZATIONS ||--o{ ORG_MEMBERS : "has members"
    ORGANIZATIONS ||--o{ EVENTS : "hosts"
    USERS ||--o{ REGISTRATIONS : "registers for"
    EVENTS ||--o{ REGISTRATIONS : "has attendees"
    USERS ||--o{ BOOKMARKS : "bookmarks"
    EVENTS ||--o{ BOOKMARKS : "is bookmarked by"
    USERS ||--o{ NOTIFICATIONS : "receives"
```

## Table Descriptions

### `users`
Stores user profile information. Authentication is handled by Supabase Auth, which maintains its own `auth.users` table. When a user signs up, a trigger or the backend creates a corresponding record in the public `users` table.
- **id**: UUID, matches `auth.users.id`.
- **role**: Enum/String defining platform access level (`student`, `organizer`, `admin`).

### `organizations`
Groups that can host events.
- **slug**: Unique URL-friendly string.
- **status**: Controls visibility. Must be `active` to host public events.

### `org_members`
Junction table linking users to organizations with specific roles (e.g., an org admin can edit org details and create events).

### `events`
The core entity.
- **capacity**: Integer limit for attendees. If `null`, capacity is unlimited.
- **tags**: JSONB array of strings for flexible categorization.

### `registrations`
Records a user's intent to attend an event.
- **Composite PK**: `(user_id, event_id)` prevents duplicate registrations.

### `bookmarks`
Events saved by users for later.
- **Composite PK**: `(user_id, event_id)`.

### `notifications`
In-app alerts for users (e.g., "Event cancelled", "Registration confirmed").

## Index Strategy

To ensure high performance for common queries, the following indexes are implemented (or should be):

1. **Foreign Keys**: Indexes on all foreign key columns (`org_id`, `user_id`, `event_id`).
2. **Lookup Fields**:
   - `events.slug` (UNIQUE)
   - `organizations.slug` (UNIQUE)
3. **Filtering & Sorting**:
   - `events.start_time` (often used to find upcoming events).
   - `events.status` (frequently filtered by `published`).
   - `events.category`
4. **JSONB / Array**: GIN indexes on `events.tags` and `users.interests` to speed up overlap queries and search.

## Constraints

- **Unique Constraints**: User emails, event slugs, org slugs.
- **Check Constraints**: `events.end_time > events.start_time`.
- **Referential Integrity**: Standard foreign key constraints with `ON DELETE CASCADE` where appropriate (e.g., deleting an event deletes its registrations and bookmarks).

## Migration Approach

Database migrations are managed in two potential ways depending on the environment setup:
1. **Raw SQL (`schema.sql`)**: Used primarily for initial Supabase project setup to quickly establish the core tables, RLS (Row Level Security) policies, and Supabase-specific functions.
2. **Alembic**: Used within the FastAPI app (`alembic/` directory) for incremental schema changes and version control of the database schema in Python.
