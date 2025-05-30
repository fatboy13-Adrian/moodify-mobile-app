// JavaScript for activity screen styles
// ActivityScreenStyles.js

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    headerContainer: {
        backgroundColor: '#3A506B',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    subheader: {
        fontSize: 16,
        textAlign: 'center',
        color: '#D1E3F5',
        marginTop: 5,
    },
    weatherContainer: {
        margin: 20,
        marginTop: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#3A506B',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    weatherButton: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingVertical: 15,
        paddingHorizontal: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeButton: {
        backgroundColor: '#4A90E2',
    },
    buttonText: {
        color: '#495057',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    activeButtonText: {
        color: '#FFF',
    },
    activitiesContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    activitiesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    listHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3A506B',
        marginLeft: 8,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    listItem: {
        fontSize: 16,
        color: '#495057',
        marginLeft: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
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
});

export default styles;