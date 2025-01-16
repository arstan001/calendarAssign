import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
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
import {
  FlatList,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  withSequence,
} from 'react-native-reanimated';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_LENGTH = SCREEN_WIDTH / 7;
const ITEMS_PER_PAGE = 7;
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CLOSED_HEIGHT = 100;
const OPEN_HEIGHT = 350;
const THRESHOLD = 50;

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [visibleDates, setVisibleDates] = useState({
    currentMonth: format(new Date(), 'yyyy MMMM'),
    nextMonth: format(new Date(), 'yyyy MMMM')
  });
  const height = useSharedValue(CLOSED_HEIGHT);
  const context = useSharedValue({ y: 0 });
  const monthScrollX = useSharedValue(0);
  const weekScrollX = useSharedValue(0);
  const getInitialDates = useCallback(() => {
    const last2WeekOfToday = subDays(new Date(), 7 * 2);
    const next2WeekOfToday = addDays(new Date(), 7 * 2);
    const startLast2Week = startOfWeek(last2WeekOfToday, { weekStartsOn });
    const endNext2Week = endOfWeek(next2WeekOfToday, { weekStartsOn });
    return eachDayOfInterval({ start: startLast2Week, end: endNext2Week });
  }, [weekStartsOn]);

  const [calendarDates, setCalendarDates] = useState(() => getInitialDates());

  const verticalGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onStart(() => {
      context.value = { y: height.value };
    })
    .onUpdate((event) => {
      const newHeight = context.value.y + event.translationY;
      if (newHeight >= CLOSED_HEIGHT && newHeight <= OPEN_HEIGHT) {
        height.value = newHeight;
      }
    })
    .onEnd((event) => {
      const shouldExpand = isExpanded ?
        -event.translationY < THRESHOLD :
        event.translationY > THRESHOLD;

      height.value = withSpring(shouldExpand ? OPEN_HEIGHT : CLOSED_HEIGHT, {
        damping: 15,
      });
      runOnJS(setIsExpanded)(shouldExpand);
    });
  const horizontalGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      context.value = { x: monthScrollX.value };
    })
    .onUpdate((event) => {
      if (isExpanded) {
        monthScrollX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (isExpanded && Math.abs(event.translationX) > SCREEN_WIDTH / 3) {
        const direction = event.translationX > 0 ? -1 : 1;
        monthScrollX.value = withSequence(
          withTiming(direction * -SCREEN_WIDTH, { duration: 200 }),
          withTiming(0, { duration: 0 })
        );
        runOnJS(setCurrentDate)(addDays(currentDate, direction * 30));
      } else {
        monthScrollX.value = withTiming(0);
      }
    });
  const gesture = Gesture.Exclusive(verticalGesture, horizontalGesture);

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
    updateVisibleDates,
    gesture,
    height,
    monthScrollX,
    setCurrentDate,
    weekScrollX
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
    updateVisibleDates,
    gesture,
    height,
    monthScrollX,
    weekScrollX

  } = useCalendar(weekStartsOn, initialDate);

  const getItemLayout = useCallback((_, index) => ({
    length: ITEM_LENGTH,
    offset: ITEM_LENGTH * index,
    index
  }), []);

  const handleMomentumScrollEnd = useCallback((event) => {
    const startIndex = Math.floor(event.nativeEvent.contentOffset.x / ITEM_LENGTH);
    updateVisibleDates(startIndex);

    if (event.nativeEvent.contentOffset.x < SCREEN_WIDTH) {
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
  const weekViewStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: weekScrollX.value }],
    opacity: interpolate(
      height.value,
      [CLOSED_HEIGHT, OPEN_HEIGHT],
      [1, 0]
    ),
  }));
  const renderItem = useCallback(({ item: date }) => (
    <DateItem
      date={date}
      onPress={handleDatePress}
      isToday={isSameDay(date, new Date())}
      isSelected={selectedDate && isSameDay(date, selectedDate)}
    />
  ), [handleDatePress, selectedDate]);

  const keyExtractor = useCallback((_, index) => index.toString(), []);
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));
  const monthViewStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: monthScrollX.value }],
    opacity: interpolate(
      height.value,
      [CLOSED_HEIGHT, OPEN_HEIGHT],
      [0, 1]
    ),
  }));
  const parseDateToMonth = () => {
    const [year, monthName] = visibleDates.currentMonth.split(' ')
    const monthIndex = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ].indexOf(monthName);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

    const prevMonthDays = Array.from(
      { length: firstDayOfMonth },
      (_, i) => new Date(year, monthIndex - 1, daysInPrevMonth - firstDayOfMonth + i + 1)
    );

    const currentMonthDays = Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, monthIndex, i + 1)
    );
    const remainingDays = (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7;

    const nextMonthDays = Array.from(
      { length: remainingDays },
      (_, i) => new Date(year, monthIndex + 1, i + 1)
    );

    const calendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    return calendarDays;
  }

  const renderMonthView = () => {
    return (
      <Animated.View style={[styles.monthView, monthViewStyle]}>
        <FlatList
          data={parseDateToMonth()}
          numColumns={7}
          scrollEnabled={false}
          renderItem={({ item: date }) => (
            <DateItem
              date={date}
              onPress={handleDatePress}
              isToday={isSameDay(date, new Date())}
              isSelected={selectedDate && isSameDay(date, selectedDate)}
              isCompact={false}
            />
          )}
          keyExtractor={(date) => date.toISOString()}
        />
      </Animated.View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <CalendarHeader
        currentMonth={visibleDates.currentMonth}
        nextMonth={visibleDates.nextMonth}
      />
      <WeekDays />
      <GestureDetector gesture={gesture}>
        <View style={{ position: 'relative' }}>
          <Animated.View style={[styles.weekView, weekViewStyle]}>
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
          </Animated.View>
          <Animated.View style={[styles.containerAnimated, containerAnimatedStyle]}>
            {renderMonthView()}
          </Animated.View>
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  weekView: {
    position: 'relative',
    zIndex: 3
  },
  containerAnimated: {
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'absolute'
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