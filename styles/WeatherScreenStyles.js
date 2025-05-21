import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    topContainer: {
        width: '100%',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        zIndex: 10,
    },
    header: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    controlPanel: {
        width: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#3498db',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flex: 0.48,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '500',
    },
    locationContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    locationInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginRight: 8,
    },
    updateButton: {
        backgroundColor: '#3498db',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#bdc3c7',
    },
    updateButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    ScrollViewContent: {
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    errorText: {
        color: '#d32f2f',
    },
    weatherContainer: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    weatherTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        color: '#666',
    },
    weatherDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        alignSelf: 'left',
    },
    weatherText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    forecastNavigation: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    navigationText: {
        color: '#666',
        fontSize: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    footerButton: {
        paddingVertical: 5,
        marginLeft: 40,
    },
    footerButtonText: {
        color: '#3498db',
        fontWeight: '500',
        fontWeight: '600',
    },
    disabledText: {
        color: '#ccc',
    },
    forecastSummary: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        fontStyle: 'italic',
        color: '#555',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 40,
    },
    logoutText: {
        marginLeft: 5,
        color: '#666',
        fontWeight: '600',
    },
    spacer: {
        height: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '85%',
        maxHeight: '70%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    areaList: {
        maxHeight: 500,
    },
    areaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    areaName: {
        fontSize: 16,
    },
    areaForecastBadge: {
        backgroundColor: '#e3f2fd',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    areaForecastText: {
        fontSize: 12,
        color: '#1976d2',
    },
    areaForecastContainer: {
        backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    areaForecastSubContainer: {
        flex: 1,
        backgroundColor: '#FDFD96',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    areaForecastTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#1976d2',
    },
    areaForecastSubTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#1976d2',
        alignItems: 'center'
    },
    validPeriodText: {
        fontSize: 11,
        marginTop: 5,
        color: '#555',
    }
});

export default styles;