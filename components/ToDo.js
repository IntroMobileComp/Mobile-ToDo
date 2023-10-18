import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, Modal, Button, TextInput, TouchableOpacity } from 'react-native';
import { DataTable } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/th';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import styles from '../style/ToDo.style';


export default function ToDo({ navigation }) {
    const [token, setToken] = useState('');
    const [activity, setActivity] = useState([]);
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [formState, setFormState] = useState({
        modalVisible: false,
        editMode: false,
        currentActivity: null
    });


    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDateTimePicker(false);
        setSelectedDate(currentDate);
        setFormState(prevState => ({
            ...prevState,
            currentActivity: { ...prevState.currentActivity, activitiesTime: currentDate }
        }));
    };
    const handleActivitySubmit = () => {
        const endpoint = formState.editMode ? `https://3ca6-161-200-191-20.ngrok-free.app/Activity/${formState.currentActivity.activityId}` : 'https://3ca6-161-200-191-20.ngrok-free.app/Activity';
        const method = formState.editMode ? 'PUT' : 'POST';
        const data = formState.editMode ? { ...formState.currentActivity } : { "activityName": "", "activitiesTime": new Date() };
        axios({
            method,
            url: endpoint,
            data,
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                if (formState.editMode) {
                    const updatedActivities = activity.map(act => act.activityId === formState.currentActivity.activityId ? formState.currentActivity : act);
                    setActivity(updatedActivities);
                } else {
                    const newActivity = response.data;
                    setActivity([...activity, newActivity]);
                }
            })
            .catch(error => {
                console.error("There was an error processing the activity: ", error);
            })
            .finally(() => {
                setFormState(prevState => ({ ...prevState, modalVisible: false, editMode: false, currentActivity: null }));
            });
    };


    const formatToThaiDateTime = (dateTime) => {
        const date = moment(dateTime);
        const year = date.year() + 543;  // Convert CE to BE
        return `${date.format('D MMM')} ${year} เวลา ${date.format('HH:mm')} น`;
    };
    const deleteActivity = async (activityId) => {
        try {
            const response = await fetch(`https://3ca6-161-200-191-20.ngrok-free.app/Activity/${activityId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "69420"
                }
            });

            if (response.status === 200) {
                setActivity(prevActivity => prevActivity.filter(act => act.activityId !== activityId));
                Alert.alert('Success', 'Activity deleted successfully');
            } else {
                Alert.alert('Error', 'Failed to delete the activity');
            }
        } catch (error) {
            console.error('Failed to delete activity:', error);
            Alert.alert('Error', 'Failed to delete the activity');
        }
    };
    useEffect(() => {
        const retrieveToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (error) {
                console.error("Failed to get the token");
            }
        };
        retrieveToken();
    }, []);
    useEffect(() => {
        if (token) {
            fetch('https://3ca6-161-200-191-20.ngrok-free.app/Activity', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, "ngrok-skip-browser-warning": "69420"
                },
            })
                .then(response => {
                    if (response.status === 401) {
                        Alert.alert("Error", "You are not authorized to view this page.");
                        return;
                    }
                    return response;
                })
                .then(response => response.json())
                .then(data => setActivity(data))
                .catch(error => console.error(error));
        }
    }, [token]);
    moment.locale('th');
    return (
        <View style={styles.container}>
            <Text style={styles.header}>ToDoList</Text>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Activities</DataTable.Title>
                    <DataTable.Title>Date/Time</DataTable.Title>
                    <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                {activity.map((item) => (
                    <DataTable.Row key={item.activityId}>
                        <DataTable.Cell>{item.activityName}</DataTable.Cell>
                        <DataTable.Cell>{formatToThaiDateTime(item.activitiesTime)}</DataTable.Cell>
                        <DataTable.Cell style={styles.actions}>
                            <TouchableOpacity onPress={() => setFormState({ modalVisible: true, editMode: true, currentActivity: item })} style={styles.buttonText}>
                                <MaterialCommunityIcons name="pencil" size={24} color="#2196F3" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteActivity(item.activityId)} style={styles.buttonText}>
                                <MaterialCommunityIcons name="delete" size={24} color="#f44336" />
                            </TouchableOpacity>
                        </DataTable.Cell>
                    </DataTable.Row>
                ))}
            </DataTable>
            <Button title="Add Activity" onPress={() => setFormState({ modalVisible: true, editMode: false, currentActivity: null })} />
            <Modal
                animationType="slide"
                transparent={true}
                visible={formState.modalVisible}
                onRequestClose={() => {
                    setFormState(prevState => ({ ...prevState, modalVisible: false, editMode: false, currentActivity: null }));
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                        <Text>{formState.editMode ? "Edit Activity" : "Add Activity"}</Text>
                        <TextInput
                            value={formState.currentActivity?.activityName || ''}
                            onChangeText={text => setFormState(prevState => ({ ...prevState, currentActivity: { ...prevState.currentActivity, activityName: text } }))}
                            placeholder="Activity Name"
                            style={{ borderBottomWidth: 1, borderBottomColor: '#ccc' }}
                        />
                        <Button
                            title="Pick Date & Time"
                            onPress={() => setShowDateTimePicker(true)}
                        />

                        {showDateTimePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="datetime"
                                display="default"
                                onChange={onChange}
                            />
                        )}
                        <Button title="Submit" onPress={handleActivitySubmit} />
                        <Button title="Cancel" onPress={() => setFormState(prevState => ({ ...prevState, modalVisible: false, editMode: false, currentActivity: null }))} />
                    </View>
                </View>
            </Modal>

        </View>
    );
}