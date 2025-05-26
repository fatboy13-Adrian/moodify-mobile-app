// JavaScript for weather screen
// WeatherScreen.js

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
import { 
    formatTemperature, 
    formatHumidity, 
    formatWindSpeed, 
    formatDate, 
    formatTime, 
    isToday 
} from '../utilities/WeatherUtils';
import handleLogout from '../utilities/LogoutUtils';

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

    // Function to fetch area-specific forecasts from data.gov.sg API
    const fetchAreaData = async () => {
        try {
            // Fetch 2-hour weather forecast for specific areas
            const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast');

            if (!response.ok) {
                throw new Error(`Failed to fetch area weather data: ${response.status}`);
            }

            const data = await response.json();
            console.log("Full API Response:", JSON.stringify(data, null, 2));
            
            // Validate and extract data more carefully
            const validPeriod = data?.data?.items?.[0]?.valid_period || {};
            console.log("Raw Valid Period:", validPeriod);

            // Process the timestamps
            const processTimestamp = (timeStamp) => {
                if (!timeStamp) return null;
                // Try to detect if it's a Unix timestamp (in seconds)
                if (/^\d+$/.test(timeStamp)) {
                    return new Date(parseInt(timeStamp) * 1000).toISOString();
                }
                return timeStamp;
            } ;

            // Process start and end time
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

    // Helper function to get forecast display label
    const getForecastDisplayLabel = (forecast, index, totalForecasts) => {
        if (index === 0) {
            return 'Today';
        } else if (index === 1) {
            return 'Tomorrow';
        } else {
            return forecast.day;
        }
    };

    // Function to process weather forecast data
    const processWeatherData = (forecasts, updatedTimestamp) => {
        if (!forecasts || forecasts.length === 0) {
            throw new Error('No forecast data available');
        }

        // Get the first forecast (tomorrow's forecast since API provides future dates)
        const firstForecast = forecasts[0];
        const today = new Date();

        return {
            // Location
            location: location,

            // Temperature
            temperature: {
                min: formatTemperature(firstForecast?.temperature?.low),
                max: formatTemperature(firstForecast?.temperature?.high),
            },

            // Humidity
            humidity: {
                min: formatHumidity(firstForecast?.relativeHumidity?.low),
                max: formatHumidity(firstForecast?.relativeHumidity?.high),
            },

            // Forecast
            forecast: firstForecast?.forecast?.text || 'No forecast available',
            
            // Forecast Summary
            forecastSummary: firstForecast?.forecast?.summary || '',
            
            // Windspeed
            windSpeed: {
                min: formatWindSpeed(firstForecast?.wind?.speed?.low),
                max: formatWindSpeed(firstForecast?.wind?.speed?.high),
            },

            // Wind Direction
            windDirection: firstForecast?.wind?.direction || '',
            
            // Last updated date - use the API's updated timestamp or current time
            lastUpdated: updatedTimestamp ? formatDate(updatedTimestamp) : formatDate(new Date().toISOString()),
            
            // Date - use today's date for display, not the forecast timestamp
            date: formatDate(today.toISOString()),
            
            // Day - use current day
            day: getForecastDisplayLabel(firstForecast, 0, forecasts.length),
            
            // Store all forecasts for potential future use
            allForecasts: forecasts,

            // Current forecast index for display
            currentIndex: 0,

            // Today indicator - always true for the initial display
            isToday: true,

            // API updated timestamp
            apiUpdatedTime: updatedTimestamp
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

            // Process weather data with the API's updated timestamp
            const processedData = processWeatherData(forecasts, record.updatedTimestamp);
            setWeatherData(processedData);

            // Reset forecast index when fteching new data
            setCurrentForecastIndex(0);

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

    // Function to update specific location
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

    // Update display with selected forecast day
    useEffect(() => {
        if (weatherData?.allForecasts && weatherData.allForecasts.length > 0) {
            const selectedForecast = weatherData.allForecasts[currentForecastIndex];

            if (selectedForecast) {
                // Calculate the display date based on current forecast index
                const today = new Date();
                const displayDate = new Date(today);
                displayDate.setDate(today.getDate() + currentForecastIndex);

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
                    // Use calculated display date instead of forecast timestamp
                    date: formatDate(displayDate.toISOString()),
                    day: getForecastDisplayLabel(selectedForecast, currentForecastIndex, weatherData.allForecasts.length),
                    // Only today (index 0) should be marked as isToday
                    isToday: currentForecastIndex === 0,
                    currentIndex: currentForecastIndex
                }));

                // Update area forecast if area is selected (only for today's forecast)
                if (selectedArea && currentForecastIndex === 0) {
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

                            {/* Display area-specific 2-hourly weather forecast if available (only for today) */}
                            {selectedArea && weatherData.areaForecast && weatherData.isToday && (
                                <View style={styles.areaForecastContainer}>
                                    <Text style={styles.areaForecastTitle}>
                                        Today's 2-Hourly Forecast
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

                    {/* Activity screen button */}
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
                        onPress={()=> handleLogout(navigation)}    
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