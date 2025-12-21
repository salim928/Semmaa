"""Initial database schema for SEMMA-AI

Revision ID: 001_initial
Revises: 
Create Date: 2025-12-18

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('telegram_id', sa.BigInteger(), unique=True, nullable=True),
        sa.Column('phone_number', sa.String(20), unique=True, nullable=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('region', sa.String(100), nullable=True),
        sa.Column('crops', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('farm_size_acres', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_users_telegram_id', 'users', ['telegram_id'])
    op.create_index('idx_users_phone_number', 'users', ['phone_number'])

    # Conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('response', sa.Text(), nullable=False),
        sa.Column('message_type', sa.String(50), nullable=False),  # text, image, audio
        sa.Column('language', sa.String(10), server_default='en', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('idx_conversations_created_at', 'conversations', ['created_at'])

    # Feedback table
    op.create_table(
        'feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),  # 1-5
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('category', sa.String(50), nullable=True),  # accuracy, helpfulness, speed
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_feedback_user_id', 'feedback', ['user_id'])
    op.create_index('idx_feedback_rating', 'feedback', ['rating'])

    # Market prices table
    op.create_table(
        'market_prices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('commodity', sa.String(100), nullable=False),
        sa.Column('region', sa.String(100), nullable=False),
        sa.Column('price_per_kg', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(10), server_default='GHS', nullable=False),
        sa.Column('market_name', sa.String(255), nullable=True),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_market_prices_commodity', 'market_prices', ['commodity'])
    op.create_index('idx_market_prices_region', 'market_prices', ['region'])
    op.create_index('idx_market_prices_date', 'market_prices', ['date'])

    # Knowledge base entries (for tracking document usage)
    op.create_table(
        'knowledge_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('document_name', sa.String(255), nullable=False),
        sa.Column('section', sa.String(255), nullable=True),
        sa.Column('content_hash', sa.String(64), nullable=False),
        sa.Column('usage_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('last_used', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_knowledge_entries_document', 'knowledge_entries', ['document_name'])


def downgrade() -> None:
    op.drop_index('idx_knowledge_entries_document')
    op.drop_table('knowledge_entries')
    
    op.drop_index('idx_market_prices_date')
    op.drop_index('idx_market_prices_region')
    op.drop_index('idx_market_prices_commodity')
    op.drop_table('market_prices')
    
    op.drop_index('idx_feedback_rating')
    op.drop_index('idx_feedback_user_id')
    op.drop_table('feedback')
    
    op.drop_index('idx_conversations_created_at')
    op.drop_index('idx_conversations_user_id')
    op.drop_table('conversations')
    
    op.drop_index('idx_users_phone_number')
    op.drop_index('idx_users_telegram_id')
    op.drop_table('users')
