import json
import logging
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from pathlib import Path

@dataclass
class FeedbackData:
    interaction_id: str
    farmer_id: str
    query: str
    response: str
    feedback_type: str  # 'rating', 'implementation', 'outcome'
    feedback_value: any
    timestamp: datetime
    context: Dict
    follow_up_needed: bool = False

@dataclass
class ResponseQuality:
    relevance_score: float
    actionability_score: float
    clarity_score: float
    local_context_score: float
    overall_score: float

class FeedbackSystem:
    def __init__(self, db_path: str = "data/feedback/feedback.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.setup_database()
        
    def setup_database(self):
        """Initialize feedback database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    interaction_id TEXT NOT NULL,
                    farmer_id TEXT NOT NULL,
                    query TEXT NOT NULL,
                    response TEXT NOT NULL,
                    feedback_type TEXT NOT NULL,
                    feedback_value TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    context TEXT NOT NULL,
                    follow_up_needed BOOLEAN DEFAULT FALSE,
                    processed BOOLEAN DEFAULT FALSE
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS response_quality (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    interaction_id TEXT NOT NULL,
                    relevance_score REAL,
                    actionability_score REAL,
                    clarity_score REAL,
                    local_context_score REAL,
                    overall_score REAL,
                    timestamp TEXT NOT NULL
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS implementation_tracking (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    interaction_id TEXT NOT NULL,
                    farmer_id TEXT NOT NULL,
                    advice_implemented BOOLEAN,
                    implementation_date TEXT,
                    outcome_reported TEXT,
                    success_rating INTEGER,
                    challenges_faced TEXT,
                    timestamp TEXT NOT NULL
                )
            """)

    def collect_immediate_feedback(self, interaction_id: str, farmer_id: str, 
                                 query: str, response: str, context: Dict) -> Dict:
        """Collect immediate feedback (thumbs up/down, clarity rating)"""
        feedback_prompts = {
            'telegram': "Please rate this response using the buttons below.",
            'sms': "Reply with: 1=Helpful, 2=Not helpful, 3=Unclear",
            'web': "Please rate this response (1-5 stars) and let us know if anything was unclear."
        }
        
        return {
            'interaction_id': interaction_id,
            'feedback_prompt': feedback_prompts.get(context.get('channel', 'telegram')),
            'quick_rating_options': ['helpful', 'not_helpful', 'unclear', 'need_more_info']
        }

    def store_feedback(self, feedback: FeedbackData):
        """Store feedback in database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO feedback 
                (interaction_id, farmer_id, query, response, feedback_type, 
                 feedback_value, timestamp, context, follow_up_needed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                feedback.interaction_id,
                feedback.farmer_id,
                feedback.query,
                feedback.response,
                feedback.feedback_type,
                json.dumps(feedback.feedback_value),
                feedback.timestamp.isoformat(),
                json.dumps(feedback.context),
                feedback.follow_up_needed
            ))

    def track_implementation(self, interaction_id: str, farmer_id: str, 
                           implemented: bool, outcome: str = None, 
                           challenges: str = None, success_rating: int = None):
        """Track whether farmer implemented the advice"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO implementation_tracking
                (interaction_id, farmer_id, advice_implemented, implementation_date,
                 outcome_reported, success_rating, challenges_faced, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                interaction_id,
                farmer_id,
                implemented,
                datetime.now().isoformat() if implemented else None,
                outcome,
                success_rating,
                challenges,
                datetime.now().isoformat()
            ))

    def schedule_follow_up(self, interaction_id: str, farmer_id: str, 
                          days_delay: int = 14):
        """Schedule follow-up to check implementation"""
        follow_up_date = datetime.now().timestamp() + (days_delay * 24 * 3600)
        
        follow_up_data = {
            'interaction_id': interaction_id,
            'farmer_id': farmer_id,
            'scheduled_date': follow_up_date,
            'follow_up_type': 'implementation_check',
            'message_template': 'follow_up_implementation'
        }
        
        # Store in follow-up queue
        follow_up_file = self.db_path.parent / 'follow_up_queue.jsonl'
        with open(follow_up_file, 'a') as f:
            f.write(json.dumps(follow_up_data) + '\n')

    def evaluate_response_quality(self, response: str, query: str, 
                                context: Dict) -> ResponseQuality:
        """Evaluate response quality automatically"""
        relevance_score = self._calculate_relevance_score(response, query)
        actionability_score = self._calculate_actionability_score(response)
        clarity_score = self._calculate_clarity_score(response)
        local_context_score = self._calculate_local_context_score(response, context)
        
        overall_score = (relevance_score + actionability_score + 
                        clarity_score + local_context_score) / 4
        
        return ResponseQuality(
            relevance_score=relevance_score,
            actionability_score=actionability_score,
            clarity_score=clarity_score,
            local_context_score=local_context_score,
            overall_score=overall_score
        )

    def _calculate_relevance_score(self, response: str, query: str) -> float:
        """Calculate how relevant the response is to the query"""
        query_keywords = set(query.lower().split())
        response_keywords = set(response.lower().split())
        
        overlap = len(query_keywords.intersection(response_keywords))
        return min(overlap / len(query_keywords), 1.0) if query_keywords else 0.0

    def _calculate_actionability_score(self, response: str) -> float:
        """Calculate how actionable the advice is"""
        action_indicators = [
            'plant', 'apply', 'use', 'mix', 'spray', 'harvest', 'water',
            'fertilize', 'weed', 'prepare', 'monitor', 'check', 'measure'
        ]
        
        action_count = sum(1 for word in action_indicators 
                          if word in response.lower())
        return min(action_count / 3, 1.0)

    def _calculate_clarity_score(self, response: str) -> float:
        """Calculate clarity based on sentence length and complexity"""
        sentences = response.split('.')
        if not sentences:
            return 0.0
            
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        if avg_sentence_length <= 15:
            return 1.0
        elif avg_sentence_length <= 25:
            return 0.7
        else:
            return 0.4

    def _calculate_local_context_score(self, response: str, context: Dict) -> float:
        """Calculate how well the response incorporates local context"""
        local_indicators = [
            context.get('region', '').lower(),
            context.get('season', '').lower(),
            'ghana', 'local', 'traditional', 'community'
        ]
        
        local_mentions = sum(1 for indicator in local_indicators 
                           if indicator and indicator in response.lower())
        return min(local_mentions / 2, 1.0)

    def get_feedback_analytics(self) -> Dict:
        """Get comprehensive feedback analytics"""
        with sqlite3.connect(self.db_path) as conn:
            # Implementation rate
            impl_stats = conn.execute("""
                SELECT 
                    COUNT(*) as total_tracked,
                    SUM(CASE WHEN advice_implemented THEN 1 ELSE 0 END) as implemented,
                    AVG(success_rating) as avg_success_rating
                FROM implementation_tracking
                WHERE timestamp > datetime('now', '-30 days')
            """).fetchone()
            
            # Response quality trends
            quality_trends = conn.execute("""
                SELECT 
                    DATE(timestamp) as date,
                    AVG(overall_score) as avg_quality,
                    COUNT(*) as response_count
                FROM response_quality
                WHERE timestamp > datetime('now', '-30 days')
                GROUP BY DATE(timestamp)
                ORDER BY date
            """).fetchall()
            
        return {
            'implementation_rate': impl_stats[1] / impl_stats[0] if impl_stats[0] > 0 else 0,
            'average_success_rating': impl_stats[2] or 0,
            'quality_trends': [
                {'date': row[0], 'quality': row[1], 'count': row[2]} 
                for row in quality_trends
            ]
        }

    async def handle_feedback(self, update, context):
        """Handle incoming feedback from users"""
        user = update.message.from_user
        interaction_id = str(update.message.message_id)
        farmer_id = str(user.id)
        query = context.user_data.get('last_query', '')
        response = context.user_data.get('last_response', '')
        
        # Parse feedback type and value
        feedback_text = update.message.text
        if feedback_text in ['👍', '👎']:
            feedback_type = 'rating'
            feedback_value = 1 if feedback_text == '👍' else 0
        elif feedback_text.isdigit():
            feedback_type = 'implementation'
            feedback_value = int(feedback_text)
        else:
            feedback_type = 'outcome'
            feedback_value = feedback_text
        
        # Get current timestamp
        timestamp = datetime.now()
        
        # Extract context for feedback
        channel = context.user_data.get('channel', 'telegram')
        location = context.user_data.get('location', {})
        
        feedback = FeedbackData(
            interaction_id=interaction_id,
            farmer_id=farmer_id,
            query=query,
            response=response,
            feedback_type=feedback_type,
            feedback_value=feedback_value,
            timestamp=timestamp,
            context={
                'channel': channel,
                'location': location
            }
        )
        
        # Store feedback in database
        self.store_feedback(feedback)
        
        # Immediate response to user
        await update.message.reply_text(    
            "✅ Thank you for your feedback! It helps us improve SemmaAI for all farmers.",
            parse_mode='Markdown'
        )

        # If rating or implementation feedback, schedule follow-up
        if feedback_type in ['rating', 'implementation']:
            self.schedule_follow_up(interaction_id, farmer_id, days_delay=7)
        
        # Log the feedback
        logging.info(f"Feedback received: {asdict(feedback)}")
