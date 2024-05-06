import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Button, Image, StyleSheet, TouchableOpacity, Pressable, Text, View, ActivityIndicator, Alert } from 'react-native';
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {  useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import img from '../assets/onboarding1.avif'



const im = {uri: "https://media.istockphoto.com/id/1251219217/vector/web.jpg?s=612x612&w=0&k=20&c=VtGxFsluf9W-ketrtZe5qaY-_KP7dAcaZDl8QuCN9VU="}



export default function HomeScreen ({navigation, route}) {
        
    return(
      <View style = {styles.container}>

        <Text/>
        <Text/>
        <Text/>
        <Text/>
        <Text/>
        <Text/>
        
        <Image source = {im} style = {styles.img} />
        <Text/>
        <Text/>
        <Text/>
        
        <Text style={styles.title}>Welcome to SmartLens!</Text>
            
        <Text/>
        <Text/>
        <Text/>
        <TouchableOpacity style={styles.button} onPress={()=> navigation.push('Scan')}>
            <Text style={styles.text}>Next</Text>
        </TouchableOpacity>
       
      
      </View>
      
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      flexDirection:'column'
    },
    img: {
      flex:0.6,
      resizeMode: 'cover',
      justifyContent: 'center'
    },
    text:{
      fontSize: 16,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      fontFamily:'Roboto_700Bold',
    },
    title:{
      alignSelf: 'center',
      justifyContent:'center',
      fontSize:20,
      color:'black',
      fontFamily:'Roboto_700Bold',
    },
    button:{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      marginHorizontal:140,
      borderRadius: 4,
      elevation: 3,
      borderColor: 'green',
      backgroundColor: 'lightgreen',
    
    },
  buttonContainer:{
  
  }}
  );
  