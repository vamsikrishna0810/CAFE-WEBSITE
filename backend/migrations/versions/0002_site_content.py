"""Add editable public site copy and social links."""

from alembic import op
import sqlalchemy as sa

revision = "0002_site_content"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("cafe_settings", sa.Column("about_text", sa.Text(), nullable=False, server_default=""))
    op.add_column("cafe_settings", sa.Column("announcement_text", sa.String(240), nullable=False, server_default=""))
    op.add_column("cafe_settings", sa.Column("instagram_url", sa.String(1000), nullable=False, server_default=""))
    op.add_column("cafe_settings", sa.Column("facebook_url", sa.String(1000), nullable=False, server_default=""))


def downgrade() -> None:
    op.drop_column("cafe_settings", "facebook_url")
    op.drop_column("cafe_settings", "instagram_url")
    op.drop_column("cafe_settings", "announcement_text")
    op.drop_column("cafe_settings", "about_text")
