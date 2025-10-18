"""
Database models for SirenBase inventory management system.

Table Relationships:
-------------------

1. User -> Items (One-to-Many)
   - One user can add many items
   - Foreign Key: Item.added_by -> User.id
   - Constraint: RESTRICT (prevent deletion of users who have added items)

2. User -> History (One-to-Many)
   - One user can have many history entries
   - Foreign Key: History.user_id -> User.id
   - Constraint: RESTRICT (preserve audit trail integrity)

3. User -> Items (Removal Tracking)
   - One user can remove many items
   - Foreign Key: Item.removed_by -> User.id (nullable)
   - Constraint: SET NULL (preserve item record if user deleted)

Database Schema Overview:
------------------------

users:
  - id (UUID, PK)
  - partner_number (String, Unique, Indexed)
  - name (String)
  - pin_hash (String, bcrypt hashed)
  - role (Enum: admin/staff)
  - created_at (Timestamp)
  - updated_at (Timestamp)

items:
  - id (UUID, PK)
  - name (String)
  - code (String(4), Unique, Indexed)
  - added_by (UUID, FK -> users.id)
  - added_at (Timestamp)
  - is_removed (Boolean, Indexed)
  - removed_at (Timestamp, Nullable)
  - removed_by (UUID, FK -> users.id, Nullable)

history:
  - id (UUID, PK)
  - action (Enum: ADD/REMOVE, Indexed)
  - item_name (String)
  - item_code (String(4), Indexed)
  - user_id (UUID, FK -> users.id, Indexed)
  - timestamp (Timestamp, Indexed)
  - notes (Text, Nullable)

Indexes:
--------
- users.partner_number (for authentication lookups)
- items.code (for item removal by code)
- items.is_removed (for filtering active inventory)
- history.action (for filtering by action type)
- history.item_code (for item history lookup)
- history.user_id (for user activity history)
- history.timestamp (for chronological sorting)
"""

from app.models.user import User, UserRole
from app.models.item import Item
from app.models.history import History, HistoryAction

__all__ = [
    'User',
    'UserRole',
    'Item',
    'History',
    'HistoryAction',
]
