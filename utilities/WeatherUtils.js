// JavaScript for weather utilities
// WeatherUtils.js

// Helper function to format temperature
export const formatTemperature = (temp) => temp ? `${temp}°C` : 'N/A';

// Helper function to format humidity
export const formatHumidity = (humidity) => humidity ? `${humidity}%` : 'N/A';

// Helper functon to format wind speed
export const formatWindSpeed = (speed) => speed ? `${speed} km/h` : 'N/A';

// Helper function to format date
export const formatDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleDateString('en-SG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    try {
        // Ensure the timestamp is parsed correctly
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid timestamp');
        }
        return date.toLocaleDateString('en-SG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.warn('Date formatting error:', error);
        // Return current date as fallback
        return new Date().toLocaleDateString('en-SG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Helper function to format time
export const formatTime = (timestamp) => {
    if (!timestamp) return '';

    try {
        // Handle both ISO strings and Unix timestamps
        const date = timestamp.length > 13 ? new Date(timestamp) : new Date(parseInt(timestamp));

        if (isNaN(date.getTime())) {
            console.warn('Invalid timestamp: ' , timestamp);
            return '';
        }

        // Format for Singapore timezone (GMT+8)
        return date.toLocaleTimeString('en-SG', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Singapore',
            hour12: false
        });
    } catch (error) {
        console.warn('Time formatting error:', error, 'Timestamp:', timestamp);
        return '';
    }
};

// Helper function to determine if forecast is for today
export const isToday =(timestamp) => {
    if (!timestamp) return true;
    const forecastDate = new Date(timestamp);
    const today = new Date();
    return forecastDate.toDateString() === today.toDateString();
};