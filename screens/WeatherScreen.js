import { useState, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Alert,
    Modal,
    FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/WeatherScreenStyles';

const WeatherApp = () => {
    const navigation = useNavigation();
    const [currentForecastIndex, setCurrentForecastIndex] = useState(0);
    const [location, setLocation] = useState('Singapore');
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [areaData, setAreaData] = useState(null);
    const [showAreaModal, setShowAreaModal] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [areas, setAreas] = useState([]);

    // Helper function to format temperature
    const formatTemperature = (temp) => temp ? `${temp}°C` : 'N/A';

    // Helper function to format humidity
    const formatHumidity = (humidity) => humidity ? `${humidity}%` : 'N/A';

    // Helper functon to format wind speed
    const formatWindSpeed = (speed) => speed ? `${speed} km/h` : 'N/A';
    
    // Helper function to format date
    const formatDate = (timestamp) => {
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
    const formatTime = (timestamp) => {
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
    const isToday =(timestamp) => {
        if (!timestamp) return true;
        const forecastDate = new Date(timestamp);
        const today = new Date();
        return forecastDate.toDateString() === today.toDateString();
    };

    // Function to fetch area-specific forecasts from data.gov.sg API
    const fetchAreaData = async () => {
        try {
            // Fetch 2-hour weather forecase for specific areas
            const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast');

            if (!response.ok) {
                throw new Error(`Failed to fetch area weather data: ${response.status}`);
            }

            const data = await response.json();
            console.log("Full API Response:", JSON.stringify(data, null, 2));
            
            // Validate amd extract data more carefully
            const validPeriod = data?.data?.items?.[0]?.valid_period || {};
            console.log("Raw Valid Period:", validPeriod);

            // Process the timestamps
            const processTimestamp = (ts) => {
                if (!ts) return null;
                // Try to detect if it's a Unix timestamp (in seconds)
                if (/^\d+$/.test(ts)) {
                    return new Date(parseInt(ts) * 1000).toISOString();
                }
                return ts;
            } ;

            const processedStart = processTimestamp(validPeriod.start);
            const processedEnd = processTimestamp(validPeriod.end);

            console.log("Processed Start:", processedStart, "->", formatTime(processedStart));
            console.log("Processed End:", processedEnd, "->", formatTime(processedEnd));

            // Extract area metadata
            const areaMetadata = data?.data?.area_metadata || [];
            const forecasts = data?.data?.items[0]?.forecasts || [];

            // Map area metadata with forecasts
            const processedAreas = areaMetadata.map(area => {
                const areaForecast = forecasts.find(f => f.area === area.name);

                return {
                    name: area.name,
                    location: area.label_location,
                    forecast: areaForecast?.forecast || 'Unknown',
                };
            }).sort((a, b) => a.name.localeCompare(b.name));
            
            setAreas(processedAreas);
            setAreaData({
                areas: processedAreas,
                validPeriod: {
                    start: validPeriod.start ? formatTime(validPeriod.start) : 'Now',
                    end: validPeriod.end ? formatTime(validPeriod.end) : '2 hours later'
                },
                timestamp: data?.data?.items?.[0]?.update_timestamp || new Date().toISOString()
            });

            return processedAreas;
        } catch (err) {
            console.error('Area data fetch error:', err);
            setError('Failed to fetch area weather data. Please try again.');
        }; 
    };

    // Update weather display based on selected area
    const updateSelectedAreaWeather = (area, areasList = areas) => {
        const areaInfo = areasList.find(a => a.name === area);

        if (areaInfo && weatherData) {
            setWeatherData(prev => ({
                ...prev,
                location: areaInfo.name,
                areaForecast: areaInfo.forecast,
                validTimeStart: areaData?.validPeriod?.start || '',
                validTimeEnd: areaData?.validPeriod?.end || '',
            }));
        }
    };

    // Function to handle selecting an area from the modal
    const handleAreaSelect = (area) => {
        setSelectedArea(area.name);
        setLocation(area.name);
        updateSelectedAreaWeather(area.name);
        setShowAreaModal(false);
    };

    // Function to process weather forecast data
    const processWeatherData = (forecasts) => {
        if (!forecasts || forecasts.length === 0) {
            throw new Error('No forecast data available');
        }

        // Get today's forecast (first item in the array)
        const todayForecast = forecasts[0];

        return {
            // Location
            location: location,

            // Temperature
            temperature: {
                min: formatTemperature(todayForecast?.temperature?.low),
                max: formatTemperature(todayForecast?.temperature?.high),
            },

            // Humidity
            humidity: {
                min: formatHumidity(todayForecast?.relativeHumidity?.low),
                max: formatHumidity(todayForecast?.relativeHumidity?.high),
            },

            // Forecast
            forecast: todayForecast?.forecast?.text || 'No forecast available',
            
            // Forecast Summary
            forecastSummary: todayForecast?.forecast?.summary || '',
            
            // Windspeed
            windSpeed: {
                min: formatWindSpeed(todayForecast?.wind?.speed?.low),
                max: formatWindSpeed(todayForecast?.wind?.speed?.high),
            },

            // Wind Direction
            windDirection: todayForecast?.wind?.direction || '',
            
            // Last updated date
            lastUpdated: formatDate(new Date().toISOString()),
            
            // Date
            date: formatDate(todayForecast?.timestamp),
            
            // Day
            day: todayForecast?.day || '',
            
            // Store all forecasts for potential future use
            allForecasts: forecasts,

            isToday: isToday(todayForecast?.timestamp)
        };
    };

    // Function to fetch general forecasts from data.gov.sg API
    const fetchWeatherData = async() => {
        setLoading(true);
        setError(null);

        try {
            // Fetch weather data from Singapore API using four-day-outlook endpoint
            const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook');

            if (!response.ok) {
                throw new Error(`Failed to fetch weather data: ${response.status}`);
            }

            const responseData = await response.json();
            console.log("Four-day data:", JSON.stringify(responseData, null, 2));

            // Validate the data structure
            if (!responseData?.data?.records?.[0]) {
                throw new Error('Invalid weather data format');
            }

            // Getting today's forecast (first day in the outlook)
            const record = responseData.data.records[0];
            const forecasts = record.forecasts;

            // Process weather data
            const processedData = processWeatherData(forecasts, record.updatedTimestamp);
            setWeatherData(processedData);

            // Fetch area-specific data
            await fetchAreaData();

        } catch (err) {
            const errorMessage = err.message || 'Failed to fetch weather data. Please try again.';
            setError (errorMessage);
            console.error('Weather data fetch error:', err); 
        } finally {
            setLoading(false);
        }
    };

    // Function to clear all weather data
    const clearWeatherData = () => {
        setWeatherData(null);
        setCurrentForecastIndex(0);
        setSelectedArea(null);
        setAreaData(null);
        setError(null);
    };

    // Function to update general location
    const updateLocation = () => {
        const trimmedLocation = location.trim();

        if (trimmedLocation === '') {
            Alert.alert('Error', 'Please enter a location');
            return;
        }

        // Check if location exists in our areas list
        const matchedArea = areas.find(area => 
            area.name.toLowerCase() === location.toLowerCase()
        );

        if (matchedArea) {
            setSelectedArea(matchedArea.name);
            updateSelectedAreaWeather(matchedArea.name);
        } else if (areas.length > 0) {
            // Show alert with suggestion to select from available areas
            Alert.alert(
                'Location Not Found',
                `"${trimmedLocation}" is not found in Singapore areas. Would you like to select from available areas?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Show Areas', onPress: () => setShowAreaModal(true) }
                ]
            );
        } else {
            // If no areas data, just update the location from general forecast
            setSelectedArea(null);
            if (weatherData) {
                setWeatherData(prev => ({ ...prev, location: trimmedLocation }));
            }    
        }
    };

    // Function to show next day weather forecast
    const showNextForecast = () => {
        if (weatherData?.allForecasts && weatherData.allForecasts.length > 0) {
            // Move to next forecast day, wrap around to first day if at the end
            setCurrentForecastIndex((prevIndex) =>
                (prevIndex + 1) % weatherData.allForecasts.length
            );
        }
    };

    // Function to log out of application
    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    onPress: () => {
                        // Navigate to the login screen
                        navigation.navigate('Login');
                    }
                }
            ]
        );
    };

    // Update display with selected forecast day
    useEffect(() => {
        if (weatherData?.allForecasts && weatherData.allForecasts.length > 0) {
            const selectedForecast = weatherData.allForecasts[currentForecastIndex];

            if (selectedForecast) {

                setWeatherData(prevData => ({
                    ...prevData,
                    temperature: {
                        min: formatTemperature(selectedForecast?.temperature?.low),
                        max: formatTemperature(selectedForecast?.temperature?.high),
                    },
                    humidity: {
                        min: formatHumidity(selectedForecast?.relativeHumidity?.low),
                        max: formatHumidity(selectedForecast?.relativeHumidity?.high),
                    },
                    forecast: selectedForecast?.forecast?.text || 'No forecast available',
                    forecastSummary: selectedForecast?.forecast?.summary || '',
                    windSpeed: {
                        min: formatWindSpeed(selectedForecast?.wind?.speed?.low),
                        max: formatWindSpeed(selectedForecast?.wind?.speed?.high),
                    },
                    windDirection: selectedForecast?.wind?.direction || 'N/A',
                    date: formatDate(selectedForecast.timestamp),
                    day: selectedForecast.day || '',
                    isToday: isToday(selectedForecast.timestamp)
                }));

                // Update area forecast if area is selected
                if (selectedArea) {
                    updateSelectedAreaWeather(selectedArea);
                }
            }
        }
    }, [currentForecastIndex, weatherData?.allForecasts, selectedArea]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={"dark-content"} />
                <View style={styles.topContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Weather Information</Text>
                    </View>

                    {/* Fixed control panel - always visible */}
                    <View style={styles.controlPanel}>
                    {/* Get weather information */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={fetchWeatherData}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Loading...' : 'Get Weather'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={clearWeatherData}
                            >
                                <Text style={styles.buttonText}>Clear</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Update location */}
                        <View style={styles.locationContainer}>
                            <TextInput
                                style={styles.locationInput}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Enter location"
                                editable={!loading}
                            />

                            <TouchableOpacity
                                style={[styles.updateButton, { marginRight: 5}]}
                                onPress={updateLocation}
                                disabled={loading}
                            >
                                <Text style={styles.updateButtonText}>Update</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.updateButton, (!areaData || loading) && styles.disabledButton]}
                                onPress={() => setShowAreaModal(true)}
                                disabled={!areaData || loading}
                            >
                                <Feather name="map-pin" size={14} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
                {/* Scrollable content area */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.ScrollViewContent}    
                >
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3498db" />
                            <Text style={styles.loadingText}>Fetching weather data...</Text>
                        </View>
                    )}

                    {error && (
                        <View style={styles.errorContainer}>
                        <Feather name="alert-circle" size={20} color="#e74c3c" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {weatherData && !loading && (
                        <View style={styles.weatherContainer}>
                            {/* Display weather location */}
                            <Text style={styles.weatherTitle}>
                                <Feather name="cloud" size={20} /> Weather in {weatherData.location}
                            </Text>

                            {/* Display area-specific 2-hourly weather forecast if available */}
                            {selectedArea && weatherData.areaForecast && (
                                <View style={styles.areaForecastContainer}>
                                    <Text style={styles.areaForecastTitle}>
                                        Today's 2-Hour Forecast
                                    </Text>
                                    <Text style={styles.areaForecastText}>
                                        {weatherData.areaForecast}
                                    </Text>
                                    {weatherData.validTimeStart && weatherData.validTimeEnd && (
                                        <Text style={styles.validPeriodText}>
                                            Valid from {weatherData.validTimeStart} to {weatherData.validTimeEnd}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {/* Display daily weather forecast if available */}
                            <View style={styles.areaForecastSubContainer}>
                                <Text style={styles.areaForecastSubTitle}>
                                    Daily Forecast
                                </Text>

                                {/* Display weather date */}
                                <Text style={styles.dateText}>
                                    {weatherData.date}
                                </Text>

                                {/* Display forecast summary if available */}
                                {weatherData.forecastSummary && (
                                    <Text style={styles.forecastSummary}>
                                        {weatherData.forecastSummary}
                                    </Text>
                                )}

                                {/* Display temperature */}
                                <View style={styles.weatherDetail}>
                                    <Feather name="thermometer" size={18} color="#3498db" />
                                    <Text style={styles.weatherText}>
                                        Temperature: {weatherData.temperature.min} - {weatherData.temperature.max}
                                    </Text>
                                </View>

                                {/* Display humidity */}
                                <View style={styles.weatherDetail}>
                                    <Feather name="droplet" size={18} color="#3498db" />
                                    <Text style={styles.weatherText}>
                                        Humidity: {weatherData.humidity.min} - {weatherData.humidity.max}
                                    </Text>
                                </View>

                                {/* Display rain information */}
                                <View style={styles.weatherDetail}>
                                    <Feather name="cloud-rain" size={18} color="#3498db" />
                                    <Text style={styles.weatherText}>
                                        Forecast: {weatherData.forecast}
                                    </Text>
                                </View>

                                {/* Display wind information */}
                                <View style={styles.weatherDetail}>
                                    <Feather name="wind" size={18} color="#3498db" />
                                    <Text style={styles.weatherText}>
                                        Wind Speed: {weatherData.windSpeed.min} - {weatherData.windSpeed.max}
                                        {weatherData.windDirection !== 'N/A' ? ` (${weatherData.windDirection})` : ''}
                                    </Text>
                                </View>

                                {/* Display time */}
                                <View style={styles.weatherDetail}>
                                    <Feather name="clock" size={18} color="#3498db" />
                                    <Text style={styles.weatherText}>
                                        Last Updated: {weatherData.lastUpdated}
                                    </Text>
                                </View>
                            </View>

                            {weatherData?.allForecasts && weatherData.allForecasts.length > 1 && (
                                <View style={styles.forecastNavigation}>
                                    <Text style={styles.navigationText}>
                                        Day {currentForecastIndex + 1} of {weatherData.allForecasts.length}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                    <View style={styles.spacer}></View>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('Activity')}
                        >
                            <Text style={styles.buttonText}>Go to Activity Screen</Text>
                        </TouchableOpacity>
                </ScrollView>            
        
                {/* Fixed footer - always at bottom */}
                <View style={styles.footer}>
                    {/* Get next weather forecast */}
                    <TouchableOpacity
                        style={[
                            styles.footerButton,    
                            (!weatherData?.allForecasts || weatherData.allForecasts.length <= 1) && styles.disabledButton
                        ]}
                        onPress={showNextForecast}
                        disabled={!weatherData?.allForecasts || weatherData?.allForecasts?.length <= 1}
                    >

                        <Text style={[
                            styles.footerButtonText,
                            (!weatherData || !weatherData?.allForecasts || weatherData?.allForecasts?.length <= 1) && styles.disabledText
                        ]}>Next Day</Text>
                    </TouchableOpacity>

                    {/* Log out */}
                    <TouchableOpacity 
                        style={styles.logoutButton}
                        onPress={handleLogout}    
                    >
                        <Feather name="log-out" size={16} color="#666" />
                        <Text style={styles.logoutText}>logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Area Selection Modal */}
                <Modal
                    visible={showAreaModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowAreaModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Singapore Area</Text>
                                <TouchableOpacity onPress={() => setShowAreaModal(false)}>
                                    <Feather name="x" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={areas}
                                keyExtractor={(item) => item.name}
                                renderItem={( { item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.areaItem,
                                            selectedArea === item.name && styles.selectedAreaItem    
                                        ]}
                                        onPress={() => handleAreaSelect(item)}
                                    >
                                        <Text style={[
                                            styles.areaName,
                                            selectedArea === item.name && styles.selectedAreaName
                                        ]}>
                                            {item.name}
                                        </Text>
                                        <View style={styles.areaForecastBadge}>
                                            <Text style={styles.areaForecastText}>
                                                {item.forecast}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                style={styles.areaList}
                                showVerticalScrollIndicator={true}
                            />
                        </View>
                    </View>
                </Modal>
        </SafeAreaView>
    );
};

export default WeatherApp;