"""Create initial cafe content tables."""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "menu_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("description", sa.String(500), nullable=False, server_default=""),
        sa.Column("price_minor", sa.Integer(), nullable=False),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_demo_data", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("price_minor >= 0", name="ck_menu_price_nonnegative"),
    )
    op.create_table(
        "cafe_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("display_name", sa.String(120), nullable=False),
        sa.Column("tagline", sa.String(240), nullable=False, server_default=""),
        sa.Column("phone", sa.String(40), nullable=False, server_default=""),
        sa.Column("email", sa.String(254), nullable=False, server_default=""),
        sa.Column("address", sa.String(500), nullable=False, server_default=""),
        sa.Column("map_url", sa.String(1000), nullable=False, server_default=""),
        sa.Column("timezone", sa.String(80), nullable=False, server_default="Asia/Kolkata"),
        sa.Column("currency_code", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("opening_hours_json", sa.Text(), nullable=False),
        sa.Column("is_demo_data", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "cafe_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(160), nullable=False),
        sa.Column("description", sa.String(1000), nullable=False, server_default=""),
        sa.Column("starts_at", sa.String(40), nullable=False, server_default=""),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_demo_data", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_table("cafe_events")
    op.drop_table("cafe_settings")
    op.drop_table("menu_items")
