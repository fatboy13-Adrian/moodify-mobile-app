import { useState, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Button,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
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

    // Function to fetch area-specific forecasts from data.gov.sg API
    const fetchAreaData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch 2-hour weather forecase for specific areas
            const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast');

            if (!response.ok) {
                throw new Error(`Failed to fetch area weather data: ${response.status}`);
            }

            const data = await response.json();
            console.log("data:", JSON.stringify(data, null, 2));
            
            // Check if the expected data structure exists based on the actual response format
            if (!data.data || !data.data.area_metadata || !data.data.items || !data.data.items[0]) {
                throw new Error('Invalid area weather data format');
            }

            // Extract area metadata and forecasts
            const areaMetadata = data.data.area_metadata || [];
            const forecasts = data.data.items[0]?.forecasts || [];
            const timestamp = data.data.items[0]?.update_timestamp || '';
            const validPeriod = data.data.items[0]?.valid_period || {};

            // Prepare area data with both metadata and forecasts
            const areas = areaMetadata.map(area => {
                const areaForecast = forecasts.find(f => f.area === area.name);
                return {
                    name: area.name,
                    location: area.label_location,
                    forecast: areaForecast?.forecast || 'Unknown',
                };
            });

            // Sort areas alphabetically for easier selection
            const sortedAreas = areas.sort((a, b) => a.name.localeCompare(b.name));
            
            setAreas(sortedAreas);
            setAreaData({
                areas: sortedAreas,
                validPeriod,
                timestamp
            });

            // If we have a selected area, update the weather display
            if (selectedArea) {
                updateSelectedAreaWeather(selectedArea, areas);
            }
        } catch (err) {
            console.error('Area data fetch error:', err);
            setError('Failed to fetch area weather data. Please try again.');
        } finally {
            setLoading(false);
        }
    }; 

    // Update weather display based on selected area
    const updateSelectedAreaWeather = (area, areasList = areas) => {
        const areaInfo = areasList.find(a => a.name === area);

        if (areaInfo) {
            setWeatherData(prev => {
                if (!prev) return prev; // Don't update if no weather data exists

                return {
                    ...prev,
                    location: areaInfo.name,
                    areaForecast: areaInfo.forecast,
                    lastUpdated: areaData?.timestamp ? new Date(areaData.timestamp).toLocaleDateString() : 'Today',
                    validTimeStart: areaData?.validPeriod?.start ? new Date(areaData.validPeriod.start).toLocaleTimeString() : '',
                    validTimeEnd: areaData?.validPeriod?.end ? new Date(areaData.validPeriod.end).toLocaleDateString() : '',
                };
            });
        }
    };

    // Function to handle selecting an area from the modal
    const handleAreaSelect = (area) => {
        setSelectedArea(area.name);
        setLocation(area.name);
        updateSelectedAreaWeather(area.name);
        setShowAreaModal(false);
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
            if (!responseData.data || !responseData.data.records || !responseData.data.records[0] || !responseData.data.records[0].forecasts) {
                throw new Error('Invalid weather data format');
            }

            // Getting today's forecast (first day in the outlook)
            const record = responseData.data.records[0];
            const forecasts = record.forecasts;
            const todayForecast = forecasts && forecasts[0];
            console.log("Today's forecast: ", JSON.stringify(todayForecast, null, 2));

            // Process and format the weather data for display
            const processedData = {
                location: location,
                temperature: {
                    min: todayForecast?.temperature?.low + '°C',
                    max: todayForecast?.temperature?.high + '°C',
                },
                humidity: {
                    min: todayForecast?.relativeHumidity?.low + '%',
                    max: todayForecast?.relativeHumidity?.high + '%',
                },
                forecast: todayForecast?.forecast?.text || 'No forecast available',
                forecastSummary: todayForecast?.forecast?.summary || '',
                windSpeed: {
                    min: todayForecast?.wind?.speed?.low + 'km/h',
                    max: todayForecast?.wind?.speed?.high + 'km/h',
                },
                windDirection: todayForecast?.wind?.direction || '',
                lastUpdated: new Date(record.updatedTimestamp).toLocaleDateString(),
                date: todayForecast?.timestamp ? new Date(todayForecast.timestamp).toLocaleTimeString() : 'Today',
                day: todayForecast?.day || '',
                // Store all forecasts for potential future use
                allForecasts: forecasts || [],
            };

            setWeatherData(processedData);

            // Then fetch area-specific data
            await fetchAreaData();

        } catch (err) {
            setError ('Failed to fetch weather data. Please try again.');
            console.error(err); 
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
    };

    // Function to update general location
    const updateLocation = () => {
        if (location.trim() === '') {
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
        } else {
            // If location not found, show alert with suggestion to open area list
            Alert.alert(
                'Location Not Found',
                'Would you like to select from available areas in Singapore?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Show Areas', onPress: () => setShowAreaModal(true) }
                ]
            );
        }
    };

    // Function to show next day weather forecast
    const showNextForecast = () => {
        if (weatherData && weatherData.allForecasts && weatherData.allForecasts.length > 0) {
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
        if (weatherData && weatherData.allForecasts && weatherData.allForecasts.length > 0) {
            const selectedForecast = weatherData.allForecasts[currentForecastIndex];

            setWeatherData(prevData => ({
                ...prevData,
                location: location,
                temperature: {
                    min: selectedForecast?.temperature?.low + '°C',
                    max: selectedForecast?.temperature?.high + '°C',
                },
                humidity: {
                    min: selectedForecast?.relativeHumidity?.low + '%',
                    max: selectedForecast?.relativeHumidity?.high + '%',
                },
                forecast: selectedForecast?.forecast?.text || 'No forecast available',
                forecastSummary: selectedForecast?.forecast?.summary || '',
                windSpeed: {
                    min: selectedForecast?.wind?.speed?.low + ' km/h',
                    max: selectedForecast?.wind?.speed?.high + ' km/h',
                },
                windDirection: selectedForecast?.wind?.direction || '',
                date: selectedForecast?.timestamp ? new Date(selectedForecast.timestamp).toLocaleDateString() : 'Today',
                day: selectedForecast?.day || '',
            }));

            // If there's a selected area, we update area forecase as well
            if (selectedArea) {
                updateSelectedAreaWeather(selectedArea);
            }
        }
    }, [currentForecastIndex, weatherData?.allForecasts]);

    return (
        <SafeAreaView style={styles.container}>
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
                        >
                            <Text style={styles.buttonText}>Get Weather</Text>
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
                        />

                        <TouchableOpacity
                            style={[styles.updateButton, { marginRight: 5}]}
                            onPress={updateLocation}
                        >
                            <Text style={styles.updateButtonText}>Update</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => setShowAreaModal(true)}
                            disabled={!areaData}
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
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {weatherData && (
                    <View style={styles.weatherContainer}>
                        {/* Display weather location */}
                        <Text style={styles.weatherTitle}>
                            <Feather name="cloud" size={20} /> Weather in {weatherData.location}
                        </Text>

                        {/* Display area-specific forecast if available */}
                        {selectedArea && weatherData.areaForecast && (
                            <View style={styles.areaForecastContainer}>
                                <Text style={styles.areaForecastTitle}>Today's Forecast</Text>
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

                        <View style={styles.areaForecastSubContainer}>
                            <Text style={styles.areaForecastSubTitle}>{weatherData.day} Forecast</Text>
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
                                    {weatherData.windDirection ? ` (${weatherData.windDirection})` : ''}
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

                        {weatherData.allForecasts && weatherData.allForecasts.length > 1 && (
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
                    style={styles.footerButton}
                    onPress={showNextForecast}
                    disabled={!weatherData || !weatherData.allForecasts || weatherData.allForecasts.length <= 1}
                >
                    <Text style={[
                        styles.footerButtonText,
                        (!weatherData || !weatherData.allForecasts || weatherData.allForecasts.length <= 1) && styles.disabledText
                    ]}>Next</Text>
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
                            <Text style={styles.modalTitle}>Select Area</Text>
                            <TouchableOpacity onPress={() => setShowAreaModal(false)}>
                                <Feather name="x" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={areas}
                            keyExtractor={(item) => item.name}
                            renderItem={( { item }) => (
                                <TouchableOpacity
                                    style={styles.areaItem}
                                    onPress={() => handleAreaSelect(item)}
                                >
                                    <Text style={styles.areaName}>{item.name}</Text>
                                    <View style={styles.areaForecastBadge}>
                                        <Text style={styles.areaForecastText}>
                                            {item.forecast}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            style={styles.areaList}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default WeatherApp;