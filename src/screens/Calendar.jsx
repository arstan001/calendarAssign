import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
const COLORS = {
    primary: '#0077B6',
    red: '#f94449',
    gray: '#aaaaaa',
    text: '#333',
    white: 'white'
};
const DAYS_OF_WEEK = [
    { title: 'Sun', color: COLORS.red },
    { title: 'Mon', color: COLORS.gray },
    { title: 'Tue', color: COLORS.gray },
    { title: 'Wed', color: COLORS.gray },
    { title: 'Thu', color: COLORS.gray },
    { title: 'Fri', color: COLORS.gray },
    { title: 'Sat', color: COLORS.primary }
];
export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const today = new Date()

    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const prevMonthDays = Array.from(
            { length: firstDayOfMonth },
            (_, i) => {
                return {
                    number:daysInPrevMonth - firstDayOfMonth + i + 1, 
                    active:false
                }
            })
        const currentMonthDays = Array.from(
            { length: daysInMonth }, 
            (_, i) => { return { number: i + 1, active: true } });
        
        const remainingDays = (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7;

        const nextMonthDays = Array.from(
            { length: remainingDays }, 
            (_, i) => { 
                return { 
                    number: i + 1, active: false 
                } 
            });

        const calendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

        return calendarDays;
    }

    const handleMonthChange = (increment) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    };
    const handleDateSelect = (day) => {
        if (day.active) {
            setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.number));
        }
    };
    const isCurrentDate = (day) => {
        return (
            day.active &&
            day.number === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelectedDate = (day) => (
        selectedDate &&
        day.active &&
        day.number === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear()
    );

    const renderDayCell = (day, index) => (
        <TouchableOpacity
            key={`${day.active}-${day.number}-${index}`}
            style={[
                styles.day,
                isCurrentDate(day) && styles.currentDate,
                isSelectedDate(day) && styles.selectedDay,
                !day.active && styles.disabled
            ]}
            onPress={() => handleDateSelect(day)}
            disabled={!day.active}
        >
            <Text style={[
                styles.dayText,
                isSelectedDate(day) && styles.selectedDayText
            ]}>
                {day.number}
            </Text>
        </TouchableOpacity>
    );

    const headerTitle = currentDate.toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
    });

    return (
        <SafeAreaView style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                    <Icon name="angle-left" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.monthText}>{headerTitle}</Text>
                <TouchableOpacity onPress={() => handleMonthChange(1)}>
                    <Icon name="angle-right" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <View style={styles.daysOfWeek}>
                {DAYS_OF_WEEK.map(day => (
                    <Text key={day.title} style={[styles.dayOfWeek, { color: day.color }]}>
                        {day.title}
                    </Text>
                ))}
            </View>
            <View style={styles.daysContainer}>
                {generateCalendar().map(renderDayCell)}
            </View>
        </SafeAreaView>
    );
}
const { width } = Dimensions.get('screen')
const dateSize = width * 13 / 100
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 12
    },
    navButton: {
        fontSize: 20,
        color: '#007AFF',
    },
    monthText: {
        fontSize: 18,
    },
    daysOfWeek: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    dayOfWeek: {
        fontSize: 16,
        width: '13%',
        textAlign: 'center',
        color: '#333',
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    day: {
        width: dateSize,
        height: dateSize,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 4,
        borderRadius: dateSize,
        // backgroundColor:'white'
    },
    currentDate: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    disabled: {
        opacity: 0.3
    },
    selectedDay: {
        backgroundColor: COLORS.primary
    },
    selectedDayText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    dayText: {
        fontSize: 16,
        color: COLORS.text,
    },
});
