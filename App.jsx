import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './src/screens/Home';
import Calendar from './src/screens/Calendar';
import Library from './src/screens/Library';
import MyPage from './src/screens/MyPage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Tab = createBottomTabNavigator();

const iconSize = 16
const iconColorFocused = 'black'
const iconColor = 'gray'
export default function App() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator screenOptions={{headerShown:false}}>
            <Tab.Screen name="Home" component={Home} options={{title:"HOME", tabBarActiveTintColor:"black", tabBarIcon:({focused})=><Icon name="home" size={iconSize} color={focused ? iconColorFocused:iconColor} />}}/>
            <Tab.Screen name="Calendar" component={Calendar} options={{title:"CALENDAR", tabBarActiveTintColor:"black",tabBarIcon:({focused})=><Icon name="calendar-alt" size={iconSize} color={focused ? iconColorFocused:iconColor} />}}/>
            <Tab.Screen name="Library" component={Library} options={{title:"LIBRARY", tabBarActiveTintColor:"black",tabBarIcon:({focused})=><Icon name="dumbbell" size={iconSize} color={focused ? iconColorFocused:iconColor} />}}/>
            <Tab.Screen name="MyPage" component={MyPage} options={{title:"MY PAGE", tabBarActiveTintColor:"black",tabBarIcon:({focused})=><Icon name="user-alt" size={iconSize} color={focused ? iconColorFocused:iconColor} />}}/>
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

