# Google Sheets integration
"""
Data Collector for Google Sheets Integration
Purpose: Track metrics, interactions, and feedback in Google Sheets (free database)
"""

import logging
from datetime import datetime
import json
from typing import Dict, List, Optional

try:
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
    SHEETS_AVAILABLE = True
except ImportError:
    SHEETS_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("Google Sheets integration not available. Install gspread and oauth2client.")

from config.settings import GOOGLE_SHEETS_KEY_FILE, SPREADSHEET_NAME

logger = logging.getLogger(__name__)

class DataCollector:
    def __init__(self):
        """Initialize Google Sheets connection"""
        self.client = None
        self.spreadsheet = None
        self.initialized = False
        
        if SHEETS_AVAILABLE and GOOGLE_SHEETS_KEY_FILE:
            try:
                self._initialize_sheets()
            except Exception as e:
                logger.error(f"Failed to initialize Google Sheets: {e}")
                logger.info("Continuing without Google Sheets integration")
    
    def _initialize_sheets(self):
        """Initialize Google Sheets connection and create sheets if needed"""
        try:
            # Setup credentials
            scope = ['https://spreadsheets.google.com/feeds',
                    'https://www.googleapis.com/auth/drive']
            
            creds = ServiceAccountCredentials.from_json_keyfile_name(
                GOOGLE_SHEETS_KEY_FILE, scope)
            self.client = gspread.authorize(creds)
            
            # Try to open existing spreadsheet or create new one
            try:
                self.spreadsheet = self.client.open(SPREADSHEET_NAME)
            except gspread.SpreadsheetNotFound:
                self.spreadsheet = self.client.create(SPREADSHEET_NAME)
                logger.info(f"Created new spreadsheet: {SPREADSHEET_NAME}")
            
            # Create worksheets if they don't exist
            self._setup_worksheets()
            self.initialized = True
            logger.info("Google Sheets integration initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Google Sheets: {e}")
            raise
    
    def _setup_worksheets(self):
        """Create necessary worksheets with headers"""
        worksheets = {
            "Interactions": ["Timestamp", "User_ID", "Username", "Query", 
                           "Response", "Confidence", "Response_Time"],
            "Feedback": ["Timestamp", "User_ID", "Query", "Response", 
                        "Rating", "Comment"],
            "Metrics": ["Date", "Total_Users", "Total_Queries", 
                       "Avg_Response_Time", "Positive_Feedback_%"],
            "Users": ["User_ID", "Username", "First_Interaction", 
                     "Total_Queries", "Location", "Crops"]
        }
        
        existing_sheets = [ws.title for ws in self.spreadsheet.worksheets()]
        
        for sheet_name, headers in worksheets.items():
            if sheet_name not in existing_sheets:
                worksheet = self.spreadsheet.add_worksheet(
                    title=sheet_name, rows=1000, cols=len(headers))
                worksheet.append_row(headers)
                logger.info(f"Created worksheet: {sheet_name}")
            else:
                # Ensure headers are set
                worksheet = self.spreadsheet.worksheet(sheet_name)
                if worksheet.row_count == 0 or not worksheet.row_values(1):
                    worksheet.append_row(headers)
    
    def log_interaction(self, user_id: int, username: str, query: str, 
                       response: str, confidence: str, response_time: float):
        """
        Log a user interaction
        
        Args:
            user_id: Telegram user ID
            username: Telegram username
            query: User's question
            response: Bot's response
            confidence: Confidence level
            response_time: Time taken to respond
        """
        if not self.initialized:
            self._log_to_file("interactions", {
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "username": username,
                "query": query,
                "response": response[:500],  # Truncate long responses
                "confidence": confidence,
                "response_time": response_time
            })
            return
        
        try:
            worksheet = self.spreadsheet.worksheet("Interactions")
            worksheet.append_row([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                str(user_id),
                username or "Unknown",
                query,
                response[:500],  # Truncate for Sheets cell limit
                confidence,
                f"{response_time:.2f}"
            ])
            logger.info(f"Logged interaction for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error logging interaction: {e}")
            self._log_to_file("interactions", {
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "query": query
            })
    
    def log_feedback(self, user_id: int, query: str, response: str, 
                     rating: str, comment: str = ""):
        """
        Log user feedback
        
        Args:
            user_id: Telegram user ID
            query: Original query
            response: Bot's response
            rating: User rating (positive/negative)
            comment: Optional comment
        """
        if not self.initialized:
            self._log_to_file("feedback", {
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "query": query,
                "rating": rating,
                "comment": comment
            })
            return
        
        try:
            worksheet = self.spreadsheet.worksheet("Feedback")
            worksheet.append_row([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                str(user_id),
                query,
                response[:500],
                rating,
                comment
            ])
            logger.info(f"Logged feedback from user {user_id}: {rating}")
            
        except Exception as e:
            logger.error(f"Error logging feedback: {e}")
    
    def update_user_profile(self, user_id: int, username: str, 
                           location: str = "", crops: List[str] = None):
        """
        Update or create user profile
        
        Args:
            user_id: Telegram user ID
            username: Telegram username
            location: User's location
            crops: List of crops user farms
        """
        if not self.initialized:
            return
        
        try:
            worksheet = self.spreadsheet.worksheet("Users")
            
            # Check if user exists
            all_values = worksheet.get_all_values()
            user_row = None
            
            for i, row in enumerate(all_values[1:], start=2):  # Skip header
                if row[0] == str(user_id):
                    user_row = i
                    break
            
            if user_row:
                # Update existing user
                if location:
                    worksheet.update_cell(user_row, 5, location)
                if crops:
                    worksheet.update_cell(user_row, 6, ", ".join(crops))
            else:
                # Add new user
                worksheet.append_row([
                    str(user_id),
                    username or "Unknown",
                    datetime.now().strftime("%Y-%m-%d"),
                    "1",
                    location,
                    ", ".join(crops) if crops else ""
                ])
                
            logger.info(f"Updated profile for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
    
    def get_metrics_summary(self) -> Dict:
        """
        Get summary metrics
        
        Returns:
            Dictionary with metrics summary
        """
        if not self.initialized:
            return {
                "total_users": 0,
                "total_queries": 0,
                "avg_response_time": 0,
                "positive_feedback_rate": 0
            }
        
        try:
            interactions_ws = self.spreadsheet.worksheet("Interactions")
            feedback_ws = self.spreadsheet.worksheet("Feedback")
            
            interactions = interactions_ws.get_all_values()[1:]  # Skip header
            feedback = feedback_ws.get_all_values()[1:]
            
            # Calculate metrics
            total_queries = len(interactions)
            unique_users = len(set(row[1] for row in interactions))
            
            response_times = [float(row[6]) for row in interactions if row[6]]
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            
            positive_feedback = sum(1 for row in feedback if row[4] == "positive")
            total_feedback = len(feedback)
            positive_rate = (positive_feedback / total_feedback * 100) if total_feedback > 0 else 0
            
            return {
                "total_users": unique_users,
                "total_queries": total_queries,
                "avg_response_time": round(avg_response_time, 2),
                "positive_feedback_rate": round(positive_rate, 2)
            }
            
        except Exception as e:
            logger.error(f"Error getting metrics: {e}")
            return {
                "total_users": 0,
                "total_queries": 0,
                "avg_response_time": 0,
                "positive_feedback_rate": 0
            }
    
    def _log_to_file(self, log_type: str, data: Dict):
        """Fallback logging to local file if Sheets unavailable"""
        from config.settings import FEEDBACK_DIR
        
        log_file = FEEDBACK_DIR / f"{log_type}_{datetime.now().strftime('%Y%m')}.jsonl"
        
        with open(log_file, 'a') as f:
            f.write(json.dumps(data) + '\n')