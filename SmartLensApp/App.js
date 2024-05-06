import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Button, ImageBackground, StyleSheet, TouchableOpacity, Pressable, Text, View, ActivityIndicator, Alert } from 'react-native';
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {  useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as ImagePicker from 'expo-image-picker';
import { uploadToFirebase } from './firebase-config';
import OnboardingScreen from './screens/Onboarding.js';
import HomeScreen from './screens/Homescreen.js';
import Scan from './screens/Scan.js'
import DisplayImageScreen from './screens/DisplayScreen';

const img = {uri: "https://i.pinimg.com/originals/b5/eb/21/b5eb2132dab5004d1c4f5b985bf097ca.jpg"}




 // --------------------------------------------------------------MAIN FUNCTION-----------------------------------------------------------------


const Stack = createNativeStackNavigator();

export default function App() {

  let [fontsLoaded] = useFonts({
    Roboto_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='SmartLens'>
        
        <Stack.Screen name='SmartLens' options={{headerShown:false}} component={OnboardingScreen}/>
        <Stack.Screen name='Scan' options={{headerShown:false}} component={Scan}/>
        <Stack.Screen name="DisplayImage" options={{headerShown:false}} component={DisplayImageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    
  );
}



// -----------------------------------------------------------------STYLES----------------------------------------------------------------------




