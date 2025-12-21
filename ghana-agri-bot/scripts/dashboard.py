"""
Enhanced dashboard with document usage analytics
"""

import streamlit as st
import json
import sqlite3
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
import plotly.express as px
import pandas as pd
import plotly.graph_objects as go
from collections import Counter

# Add the parent directory to the path so we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.data_collector import DataCollector
from src.feedback_system import FeedbackSystem

def load_document_usage_stats():
    """Load document usage statistics"""
    feedback_file = Path("data/feedback/knowledge_base_feedback.jsonl")
    
    if not feedback_file.exists():
        return pd.DataFrame()
    
    records = []
    with open(feedback_file, 'r') as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line))
    
    return pd.DataFrame(records)

def load_interaction_data():
    """Load interaction data from data collector"""
    try:
        data_collector = DataCollector()
        # This assumes you have a method to get interaction data
        # You might need to implement this based on your data_collector structure
        return pd.DataFrame()  # Placeholder
    except Exception as e:
        st.error(f"Error loading interaction data: {e}")
        return pd.DataFrame()

def load_feedback_data():
    """Load feedback system data"""
    try:
        feedback_system = FeedbackSystem()
        analytics = feedback_system.get_feedback_analytics()
        return analytics
    except Exception as e:
        st.error(f"Error loading feedback data: {e}")
        return {}

def show_overview():
    """Show overview page"""
    st.header("📊 Overview Dashboard")
    
    # Key metrics in columns
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Users", "150", "12")
    
    with col2:
        st.metric("Daily Queries", "45", "8")
    
    with col3:
        st.metric("Response Quality", "85%", "5%")
    
    with col4:
        st.metric("User Satisfaction", "4.2/5", "0.3")
    
    # Recent activity chart
    st.subheader("📈 Activity Trends")
    
    # Create sample data for demonstration
    dates = pd.date_range(start='2024-01-01', end='2024-01-30', freq='D')
    activity_data = pd.DataFrame({
        'date': dates,
        'queries': [20 + i % 10 + (i // 7) * 2 for i in range(len(dates))],
        'users': [10 + i % 5 + (i // 7) for i in range(len(dates))]
    })
    
    fig = px.line(activity_data, x='date', y=['queries', 'users'], 
                  title="Daily Activity Trends")
    st.plotly_chart(fig, use_container_width=True)

def show_document_usage():
    """Show document usage analytics"""
    st.header("📚 Document Usage Analytics")
    
    # Load document usage data
    doc_stats = load_document_usage_stats()
    
    if not doc_stats.empty:
        # Document usage over time
        doc_stats['date'] = pd.to_datetime(doc_stats['timestamp']).dt.date
        daily_usage = doc_stats.groupby('date').size().reset_index(name='queries')
        
        fig = px.line(daily_usage, x='date', y='queries', 
                     title="Daily Document Usage")
        st.plotly_chart(fig, use_container_width=True)
        
        # Feedback distribution
        if 'feedback' in doc_stats.columns:
            feedback_counts = doc_stats['feedback'].value_counts()
            fig_pie = px.pie(values=feedback_counts.values, names=feedback_counts.index,
                           title="Document Feedback Distribution")
            st.plotly_chart(fig_pie, use_container_width=True)
        
        # Most referenced documents (placeholder)
        st.subheader("📖 Most Referenced Documents")
        st.info("📝 Document reference tracking will be implemented when you start using the enhanced knowledge base")
        
        # Show sample document stats
        sample_docs = pd.DataFrame({
            'Document': ['Ghana Crop Guide', 'Pest Management', 'Soil Fertility', 'Seasonal Calendar'],
            'Usage Count': [45, 32, 28, 15],
            'Avg Rating': [4.2, 3.8, 4.1, 4.5]
        })
        
        st.dataframe(sample_docs, use_container_width=True)
        
    else:
        st.info("📝 No document usage data available yet. Start using the bot to see analytics!")

def show_response_quality():
    """Show response quality analytics"""
    st.header("⭐ Response Quality Analytics")
    
    # Load feedback data
    feedback_analytics = load_feedback_data()
    
    if feedback_analytics:
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric(
                "Implementation Rate", 
                f"{feedback_analytics.get('implementation_rate', 0):.1%}",
                help="Percentage of advice that farmers actually implemented"
            )
        
        with col2:
            st.metric(
                "Average Success Rating",
                f"{feedback_analytics.get('average_success_rating', 0):.1f}/5",
                help="Average rating given by farmers for implemented advice"
            )
        
        # Quality trends
        quality_trends = feedback_analytics.get('quality_trends', [])
        if quality_trends:
            df_trends = pd.DataFrame(quality_trends)
            fig = px.line(df_trends, x='date', y='quality', 
                         title="Response Quality Over Time")
            st.plotly_chart(fig, use_container_width=True)
    
    else:
        st.info("📊 No quality data available yet. The feedback system will collect this data as users interact with the bot.")

def show_user_engagement():
    """Show user engagement metrics"""
    st.header("👥 User Engagement")
    
    # Sample engagement data
    engagement_data = {
        'Active Users (Last 7 days)': 45,
        'Average Session Duration': '3.2 minutes',
        'Return Rate': '68%',
        'Most Active Time': '2-4 PM'
    }
    
    for metric, value in engagement_data.items():
        st.metric(metric, value)
    
    # User activity heatmap
    st.subheader("📅 User Activity Heatmap")
    
    # Create sample heatmap data
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    hours = list(range(6, 22))  # 6 AM to 10 PM
    
    # Generate sample activity data
    import numpy as np
    activity_matrix = np.random.randint(0, 10, size=(len(hours), len(days)))
    
    fig_heatmap = go.Figure(data=go.Heatmap(
        z=activity_matrix,
        x=days,
        y=[f"{h}:00" for h in hours],
        colorscale='Viridis'
    ))
    
    fig_heatmap.update_layout(
        title="User Activity by Day and Hour",
        xaxis_title="Day of Week",
        yaxis_title="Hour of Day"
    )
    
    st.plotly_chart(fig_heatmap, use_container_width=True)

def show_feedback_analysis():
    """Show detailed feedback analysis"""
    st.header("💬 Feedback Analysis")
    
    # Load feedback data
    doc_stats = load_document_usage_stats()
    
    if not doc_stats.empty and 'feedback' in doc_stats.columns:
        # Feedback trends
        doc_stats['date'] = pd.to_datetime(doc_stats['timestamp']).dt.date
        feedback_by_date = doc_stats.groupby(['date', 'feedback']).size().unstack(fill_value=0)
        
        fig = px.bar(feedback_by_date.reset_index(), x='date', 
                    y=['positive', 'negative'] if 'positive' in feedback_by_date.columns else [],
                    title="Feedback Trends Over Time")
        st.plotly_chart(fig, use_container_width=True)
        
        # Recent feedback
        st.subheader("📝 Recent Feedback")
        recent_feedback = doc_stats.tail(10)[['timestamp', 'query', 'feedback']]
        st.dataframe(recent_feedback, use_container_width=True)
    
    else:
        st.info("💭 No feedback data available yet. Users need to provide feedback for analysis.")

def main():
    st.set_page_config(
        page_title="SemmaAI Analytics",
        page_icon="🌾",
        layout="wide"
    )
    
    st.title("🌾 SemmaAI Enhanced Analytics")
    st.markdown("---")
    
    # Sidebar for navigation
    st.sidebar.title("📊 Navigation")
    page = st.sidebar.selectbox("Choose page", [
        "Overview", 
        "Document Usage", 
        "Response Quality",
        "User Engagement",
        "Feedback Analysis"
    ])
    
    # Add last updated info
    st.sidebar.markdown("---")
    st.sidebar.markdown(f"**Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    # Route to appropriate page
    if page == "Overview":
        show_overview()
    elif page == "Document Usage":
        show_document_usage()
    elif page == "Response Quality":
        show_response_quality()
    elif page == "User Engagement":
        show_user_engagement()
    elif page == "Feedback Analysis":
        show_feedback_analysis()

if __name__ == "__main__":
    main()

# Usage stats
with open('data/logs/usage.json', 'r', encoding='utf-8') as f:
    usage = json.load(f)
st.header("User Activity")
st.write(f"Total users: {len(set([u['user_id'] for u in usage]))}")
st.write(f"Total queries: {len(usage)}")
st.bar_chart(Counter([u['date'][:10] for u in usage]))

# Feedback stats
with open('data/feedback/feedback.db', 'r', encoding='utf-8') as f:
    feedback = json.load(f)
st.header("Feedback")
st.write(f"Total feedback: {len(feedback)}")
st.bar_chart(Counter([f['feedback_value'] for f in feedback]))