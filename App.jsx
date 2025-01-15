import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './src/screens/Home';
import Calendar from './src/screens/Calendar';
import Library from './src/screens/Library';
import MyPage from './src/screens/MyPage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const iconSize = 16
const iconColorFocused = 'black'
const iconColor = 'gray'
export default function App() {
  return (
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
  );
}



const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

