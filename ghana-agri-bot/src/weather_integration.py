"""
Weather Integration for Farming Advice
"""
import requests
from datetime import datetime, timedelta
from config.settings import WEATHER_API_KEY

class WeatherAdvisor:
    def __init__(self):
        self.api_key = WEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    def get_weather_advice(self, location="Kumasi"):
        """Get weather-based farming advice"""
        if not self.api_key:
            return None
        
        try:
            # Get current weather
            weather_url = f"{self.base_url}/weather?q={location},GH&appid={self.api_key}&units=metric"
            response = requests.get(weather_url)
            weather_data = response.json()
            
            # Get forecast
            forecast_url = f"{self.base_url}/forecast?q={location},GH&appid={self.api_key}&units=metric"
            forecast_response = requests.get(forecast_url)
            forecast_data = forecast_response.json()
            
            # Generate advice
            advice = []
            
            # Current conditions
            temp = weather_data['main']['temp']
            humidity = weather_data['main']['humidity']
            description = weather_data['weather'][0]['description']
            
            # Check for rain in next 24 hours
            rain_coming = any('rain' in item['weather'][0]['main'].lower() 
                            for item in forecast_data['list'][:8])
            
            if rain_coming:
                advice.append("🌧️ Rain expected in next 24 hours - apply fertilizer/pesticides today!")
            
            if humidity > 80:
                advice.append("⚠️ High humidity - watch for fungal diseases")
            
            if temp > 35:
                advice.append("🌡️ High temperature - ensure adequate irrigation")
            
            return {
                "current": f"{description}, {temp}°C, {humidity}% humidity",
                "advice": advice,
                "location": location
            }
            
        except Exception as e:
            print(f"Weather error: {e}")
            return None

# Add to bot.py weather command:
def weather_enhanced(location="Kumasi"):
    advisor = WeatherAdvisor()
    weather = advisor.get_weather_advice(location)
    
    if weather:
        message = f"🌤️ *Weather for {weather['location']}*\n"
        message += f"Current: {weather['current']}\n\n"
        
        if weather['advice']:
            message += "*Farming Advice:*\n"
            for advice in weather['advice']:
                message += f"{advice}\n"
        
        return message
    return "Weather data unavailable"