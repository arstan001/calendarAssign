import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  format,
  addDays,
  subDays,
  eachDayOfInterval,
  isSameDay,
  endOfWeek,
  startOfWeek,
} from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ITEM_LENGTH = width / 7;
const ITEMS_PER_PAGE = 7;
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DateItem = React.memo(({ 
  date, 
  onPress, 
  isToday, 
  isSelected 
}) => (
  <TouchableOpacity
    style={styles.itemContainer}
    onPress={() => onPress(date)}
  >
    <View style={[
      styles.itemView,
      isToday && styles.todayItem,
      isSelected && styles.selectedItem,
    ]}>
      <Text style={[
        styles.itemDateText,
        isToday && styles.todayText,
        isSelected && styles.selectedText,
      ]}>
        {format(date, 'd')}
      </Text>
    </View>
  </TouchableOpacity>
));

const WeekDays = React.memo(() => (
  <View style={styles.weekDays}>
    {WEEK_DAYS.map(day => (
      <Text key={day} style={styles.weekDay}>{day}</Text>
    ))}
  </View>
));

const CalendarHeader = React.memo(({ currentMonth, nextMonth }) => (
  <View style={styles.header}>
    <Text style={styles.headerDate}>
      {currentMonth === nextMonth 
        ? currentMonth 
        : `${currentMonth} - ${nextMonth}`}
    </Text>
  </View>
));

const useCalendar = (weekStartsOn = 0, initialDate = null) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [visibleDates, setVisibleDates] = useState({
    currentMonth: format(new Date(), 'yyyy MMMM'),
    nextMonth: format(new Date(), 'yyyy MMMM')
  });

  const getInitialDates = useCallback(() => {
    const last2WeekOfToday = subDays(new Date(), 7 * 2);
    const next2WeekOfToday = addDays(new Date(), 7 * 2);
    const startLast2Week = startOfWeek(last2WeekOfToday, { weekStartsOn });
    const endNext2Week = endOfWeek(next2WeekOfToday, { weekStartsOn });
    return eachDayOfInterval({ start: startLast2Week, end: endNext2Week });
  }, [weekStartsOn]);

  const [calendarDates, setCalendarDates] = useState(() => getInitialDates());

  const loadMoreDates = useCallback((direction) => {
    setCalendarDates(currentDates => {
      const originalDates = [...currentDates];
      if (direction === 'next') {
        const lastDate = originalDates[originalDates.length - 1];
        const nextTwoWeeks = eachDayOfInterval({
          start: addDays(lastDate, 1),
          end: addDays(lastDate, 14)
        });
        return [...originalDates, ...nextTwoWeeks];
      } else {
        const firstDate = originalDates[0];
        const previousTwoWeeks = eachDayOfInterval({
          start: subDays(firstDate, 14),
          end: subDays(firstDate, 1)
        });
        return [...previousTwoWeeks, ...originalDates];
      }
    });
  }, []);

  const updateVisibleDates = useCallback((startIndex) => {
    const visibleWeekStart = calendarDates[startIndex];
    const visibleWeekEnd = calendarDates[startIndex + 6];
    
    setVisibleDates({
      currentMonth: format(visibleWeekStart, 'yyyy MMMM'),
      nextMonth: format(visibleWeekEnd, 'yyyy MMMM')
    });
  }, [calendarDates]);

  const handleDateSelection = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  return {
    selectedDate,
    handleDateSelection,
    calendarDates,
    visibleDates,
    loadMoreDates,
    updateVisibleDates
  };
};

const Calendar = ({ onPressDate, weekStartsOn = 0, initialDate = null }) => {
  const calendarRef = useRef(null);
  const {
    selectedDate,
    handleDateSelection,
    calendarDates,
    visibleDates,
    loadMoreDates,
    updateVisibleDates
  } = useCalendar(weekStartsOn, initialDate);

  const getItemLayout = useCallback((_, index) => ({
    length: ITEM_LENGTH,
    offset: ITEM_LENGTH * index,
    index
  }), []);

  const handleMomentumScrollEnd = useCallback((event) => {
    const startIndex = Math.floor(event.nativeEvent.contentOffset.x / ITEM_LENGTH);
    updateVisibleDates(startIndex);

    if (event.nativeEvent.contentOffset.x < width) {
      loadMoreDates('previous');
      calendarRef.current?.scrollToIndex({
        index: ITEMS_PER_PAGE * 2,
        animated: false
      });
    }
  }, [updateVisibleDates, loadMoreDates]);

  const handleDatePress = useCallback((date) => {
    handleDateSelection(date);
    onPressDate?.(date);
  }, [handleDateSelection, onPressDate]);

  const renderItem = useCallback(({ item: date }) => (
    <DateItem
      date={date}
      onPress={handleDatePress}
      isToday={isSameDay(date, new Date())}
      isSelected={selectedDate && isSameDay(date, selectedDate)}
    />
  ), [handleDatePress, selectedDate]);

  const keyExtractor = useCallback((_, index) => index.toString(), []);

  return (
    <SafeAreaView style={styles.container}>
      <CalendarHeader
        currentMonth={visibleDates.currentMonth}
        nextMonth={visibleDates.nextMonth}
      />
      <WeekDays />
      <FlatList
        ref={calendarRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={ITEMS_PER_PAGE * 2}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onEndReached={() => loadMoreDates('next')}
        onEndReachedThreshold={0.01}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        data={calendarDates}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  headerDate: {
    fontSize: 18,
    color: 'black',
  },
  weekDays: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: 'gray',
    fontSize: 12,
  },
  itemContainer: {
    width: ITEM_LENGTH,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,100,100,0.1)',
  },
  itemView: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  todayItem: {
    borderColor: 'skyblue',
    borderWidth: 2,
  },
  selectedItem: {
    backgroundColor: '#007AFF',
    borderWidth: 0,
  },
  itemDateText: {
    fontSize: 15,
    color: 'black',
  },
  todayText: {
    color: 'skyblue',
  },
  selectedText: {
    color: 'white',
  },
});

export default Calendar;