# API Reference

This document outlines the REST API endpoints available in the Campus Event Platform.

All endpoints are prefixed with `/api` (or a similar version prefix configured in the app). Timestamps are returned in UTC format (ISO 8601).

## Authentication

### POST `/api/auth/signup`
- **Description**: Registers a new user after they have created an account in Supabase Auth. Syncs the user to the local database.
- **Auth Required**: Yes (Any valid JWT)
- **Request Body**:
  ```json
  {
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  }
  ```
- **Response**: `201 Created` with User schema.

### POST `/api/auth/onboarding`
- **Description**: Completes user onboarding by setting their major, graduation year, and interests.
- **Auth Required**: Yes (Student/Organizer)
- **Request Body**:
  ```json
  {
    "major": "Computer Science",
    "graduation_year": 2025,
    "interests": ["tech", "hackathon"]
  }
  ```
- **Response**: `200 OK` with updated User schema.

### GET `/api/auth/me`
- **Description**: Retrieves the currently authenticated user's profile.
- **Auth Required**: Yes (Any)
- **Query Params**: None
- **Response**: `200 OK` with User schema.

### PUT `/api/auth/me`
- **Description**: Updates the current user's profile.
- **Auth Required**: Yes (Any)
- **Request Body**: Partial User schema (e.g., `{"bio": "New bio"}`)
- **Response**: `200 OK`

---

## Events

### GET `/api/events`
- **Description**: Lists events with filtering and pagination.
- **Auth Required**: Optional (Required for personalized results)
- **Query Params**:
  - `page` (int, default 1)
  - `limit` (int, default 20)
  - `category` (string)
  - `tags` (string, comma-separated)
  - `start_date` (datetime)
  - `end_date` (datetime)
  - `search` (string)
  - `status` (string, default "published")
- **Response**: `200 OK` with Paginated Event schema.

### GET `/api/events/recommended`
- **Description**: Returns personalized event recommendations for the current user.
- **Auth Required**: Yes
- **Query Params**: `limit` (int, default 10)
- **Response**: `200 OK` with list of Event schemas.

### GET `/api/events/calendar`
- **Description**: Returns events the user is registered for, formatted for a calendar view.
- **Auth Required**: Yes
- **Query Params**: `start_date`, `end_date`
- **Response**: `200 OK` with list of Calendar Event schemas.

### GET `/api/events/conflicts`
- **Description**: Checks if a specific time window conflicts with the user's current registrations.
- **Auth Required**: Yes
- **Query Params**: `start_time` (datetime), `end_time` (datetime)
- **Response**: `200 OK` `{"has_conflict": true/false, "conflicting_events": [...]}`

### GET `/api/events/{slug}`
- **Description**: Retrieves a single event by its slug.
- **Auth Required**: Optional
- **Response**: `200 OK` with detailed Event schema.
- **Errors**: `404 Not Found`

### POST `/api/events`
- **Description**: Creates a new event.
- **Auth Required**: Yes (Organizer/Admin)
- **Request Body**: Event Create schema (title, description, start/end times, location, capacity, etc.)
- **Response**: `201 Created` with Event schema.

### PUT `/api/events/{id}`
- **Description**: Updates an existing event.
- **Auth Required**: Yes (Organizer of the event/Admin)
- **Request Body**: Partial Event schema.
- **Response**: `200 OK`

### POST `/api/events/{id}/publish`
- **Description**: Transitions an event from draft to published status.
- **Auth Required**: Yes (Organizer of the event/Admin)
- **Response**: `200 OK`

### POST `/api/events/{id}/cancel`
- **Description**: Cancels an event. Notifies registered users.
- **Auth Required**: Yes (Organizer of the event/Admin)
- **Response**: `200 OK`

### DELETE `/api/events/{id}`
- **Description**: Permanently deletes a draft event.
- **Auth Required**: Yes (Organizer of the event/Admin)
- **Response**: `204 No Content`

### GET `/api/events/{id}/registrations`
- **Description**: Lists users registered for a specific event.
- **Auth Required**: Yes (Organizer of the event/Admin)
- **Query Params**: `page`, `limit`
- **Response**: `200 OK` with list of User schemas.

---

## Organizations

### GET `/api/organizations`
- **Description**: Lists verified organizations.
- **Auth Required**: Optional
- **Query Params**: `page`, `limit`, `search`
- **Response**: `200 OK` with list of Organization schemas.

### GET `/api/organizations/{slug}`
- **Description**: Retrieves details for an organization, including upcoming events.
- **Auth Required**: Optional
- **Response**: `200 OK` with Organization detailed schema.

### POST `/api/organizations`
- **Description**: Requests the creation of a new organization. Requires admin verification.
- **Auth Required**: Yes
- **Request Body**: Org Create schema (name, description, logo_url, etc.)
- **Response**: `201 Created` with status "pending".

### PUT `/api/organizations/{id}`
- **Description**: Updates an organization's details.
- **Auth Required**: Yes (Org Owner/Admin)
- **Request Body**: Partial Org schema.
- **Response**: `200 OK`

### GET `/api/organizations/{id}/members`
- **Description**: Lists members of an organization.
- **Auth Required**: Yes (Org Member/Admin)
- **Response**: `200 OK` with list of Member schemas.

### POST `/api/organizations/{id}/members`
- **Description**: Adds a member to an organization.
- **Auth Required**: Yes (Org Owner/Admin)
- **Request Body**: `{"user_id": "uuid", "role": "member|admin"}`
- **Response**: `201 Created`

### DELETE `/api/organizations/{id}/members/{user_id}`
- **Description**: Removes a member from an organization.
- **Auth Required**: Yes (Org Owner/Admin)
- **Response**: `204 No Content`

---

## Registrations

### POST `/api/registrations`
- **Description**: Registers the current user for an event.
- **Auth Required**: Yes
- **Request Body**: `{"event_id": "uuid"}`
- **Response**: `201 Created`
- **Errors**: `409 Conflict` (Event full, schedule conflict, already registered)

### DELETE `/api/registrations/{event_id}`
- **Description**: Cancels the user's registration for an event.
- **Auth Required**: Yes
- **Response**: `204 No Content`

### GET `/api/registrations/my`
- **Description**: Lists all events the current user is registered for.
- **Auth Required**: Yes
- **Query Params**: `status` (upcoming, past, all)
- **Response**: `200 OK` with list of Event schemas.

---

## Bookmarks

### POST `/api/bookmarks`
- **Description**: Bookmarks an event for later.
- **Auth Required**: Yes
- **Request Body**: `{"event_id": "uuid"}`
- **Response**: `201 Created`

### DELETE `/api/bookmarks/{event_id}`
- **Description**: Removes a bookmark.
- **Auth Required**: Yes
- **Response**: `204 No Content`

### GET `/api/bookmarks`
- **Description**: Lists the user's bookmarked events.
- **Auth Required**: Yes
- **Response**: `200 OK`

---

## Notifications

### GET `/api/notifications`
- **Description**: Lists notifications for the current user.
- **Auth Required**: Yes
- **Query Params**: `page`, `limit`, `unread_only` (bool)
- **Response**: `200 OK` with list of Notification schemas.

### PUT `/api/notifications/{id}/read`
- **Description**: Marks a specific notification as read.
- **Auth Required**: Yes
- **Response**: `200 OK`

### PUT `/api/notifications/read-all`
- **Description**: Marks all unread notifications as read.
- **Auth Required**: Yes
- **Response**: `200 OK`

### GET `/api/notifications/unread-count`
- **Description**: Returns the count of unread notifications.
- **Auth Required**: Yes
- **Response**: `200 OK` `{"count": int}`

---

## Admin

### GET `/api/admin/organizations/pending`
- **Description**: Lists organizations awaiting verification.
- **Auth Required**: Yes (Admin)
- **Response**: `200 OK`

### POST `/api/admin/organizations/{id}/verify`
- **Description**: Approves a pending organization.
- **Auth Required**: Yes (Admin)
- **Response**: `200 OK`

### POST `/api/admin/organizations/{id}/reject`
- **Description**: Rejects a pending organization.
- **Auth Required**: Yes (Admin)
- **Response**: `200 OK`

### GET `/api/admin/events`
- **Description**: Lists all events, including drafts and cancelled, across the platform.
- **Auth Required**: Yes (Admin)
- **Response**: `200 OK`

### POST `/api/admin/events/{id}/disable`
- **Description**: Forcefully disables/hides an event for moderation.
- **Auth Required**: Yes (Admin)
- **Response**: `200 OK`

### GET `/api/admin/users`
- **Description**: Lists all users.
- **Auth Required**: Yes (Admin)
- **Response**: `200 OK`

### PUT `/api/admin/users/{id}/role`
- **Description**: Changes a user's global role.
- **Auth Required**: Yes (Admin)
- **Request Body**: `{"role": "student|organizer|admin"}`
- **Response**: `200 OK`

### GET `/api/admin/audit-logs`
- **Description**: Retrieves system audit logs.
- **Auth Required**: Yes (Admin)
- **Response**: `200 OK`

### GET `/api/admin/stats`
- **Description**: Retrieves platform statistics (total users, active events, etc.).
- **Auth Required**: Yes (Admin)
- **Response**: `200 OK`

---

## Search

### GET `/api/search`
- **Description**: Standard keyword search across events and organizations.
- **Auth Required**: Optional
- **Query Params**: `q` (string)
- **Response**: `200 OK` `{"events": [...], "organizations": [...]}`

### POST `/api/search/natural`
- **Description**: AI-powered natural language search.
- **Auth Required**: Optional
- **Request Body**: `{"query": "coding events next week with pizza"}`
- **Response**: `200 OK` Returns parsed filters and matching events.

---

## AI

### POST `/api/ai/copilot`
- **Description**: Conversational assistant for event discovery.
- **Auth Required**: Yes
- **Request Body**: `{"message": "string", "history": [...]}`
- **Response**: `200 OK` `{"reply": "string", "suggested_events": [...]}`

### POST `/api/ai/digest`
- **Description**: Generates a personalized digest/summary of upcoming events.
- **Auth Required**: Yes
- **Response**: `200 OK` `{"digest_text": "string", "events": [...]}`
