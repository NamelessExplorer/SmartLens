import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Button, ImageBackground, StyleSheet, TouchableOpacity, Text, View, ActivityIndicator, Alert, Image, Dimensions } from 'react-native';
import {useNavigation } from '@react-navigation/native';
import {  useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as ImagePicker from 'expo-image-picker';
import { uploadToFirebase } from '../firebase-config';
import img from '../assets/pharma.png'
import * as FS from "expo-file-system";
import axios from 'axios';




export default function Scan({navigation, route}){

    const [permission, requestPermission] = ImagePicker.useCameraPermissions();
    const[imageUri, setImageUri] = useState(null);


    const takePhoto = async (source) => {
      let result;

      if(source==='camera'){

        result = await ImagePicker.launchCameraAsync({
        allowsEditing : true,
        mediaTypes : ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        cameraType: ImagePicker.CameraType.back

        })
        setImageUri(result?.assets[0].uri);


        const formData = new FormData();
        formData.append("file", {
          uri: result?.assets[0].uri,
          name: 'image.png',
          filename: result?.assets[0].fileName,
          type: result?.assets[0].type,
        }); // Add the image file to FormData

        try {

            const formData = new FormData();
            formData.append('image', {
              uri: result.assets[0].uri,
              name: 'image.jpg', // Specify a filename for clarity (optional)
              type: 'image/jpeg', // Adjust based on your image type
            });

            const response = await axios.post('http://192.168.8.106:5000/uploads', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            if (response.status=200) {

              console.log('Image upload successful!');
              console.log(result.message)
              
            } else {
              console.error('Image upload failed:', response.data.error);
            }


            

  } catch (error) {
    console.error("Error sending request:", error);
  }

        navigation.navigate('DisplayImage', { imageUri: result.assets[0].uri }); 

      } else if(source==='gallery'){

        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

        setImageUri(result?.assets[0].uri);
        console.log(result);


        navigation.navigate('DisplayImage', { imageUri: result.assets[0].uri }); 
        }
        
        }  
        
        if(permission?.status !== ImagePicker.PermissionStatus.GRANTED){    
          return(
              <View style={styles.container}>
                  <Text>Permission Not Granted - {permission?.status}</Text>
                  <StatusBar style='auto'/>
                  <Button title='Request Permission' onPress={requestPermission}></Button>
              </View>
          )
        }
    
      return(
  
        <View style = {styles.container}>
            <Text/>
            <Text/>
            <Text/>
            <Text style={styles.title}>SmartLens</Text>
            <Text/>
            <Text/>
            <Text/>
            <View>
                  <ImageBackground source={img}
                  style={{width:Dimensions.get('screen').width*0.90,
                          height:220, marginLeft:20, borderTopEndRadius:30, borderRadius:30, overflow:'hidden'}}>
                  </ImageBackground>
            </View>
            <Text/>
            <Text/>
            <Text/>
            <Text style={styles.title}>What do you want to do?</Text>
            <Text></Text>
            <Text></Text>
            <Text/>
            <StatusBar style='auto'/>
              <TouchableOpacity style={styles.button} onPress={()=>takePhoto('camera')}>
                <Text style={styles.text}>Scan Now</Text>
              </TouchableOpacity>
              <Text></Text>
              <TouchableOpacity style={styles.button} onPress={()=>takePhoto('gallery')}>
                <Text style={styles.text}>Open Gallery</Text>
              </TouchableOpacity>
            <Text></Text>
            <Text/>
            
            </View>
      );
  
  };

  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white'
    },
    img: {
      flex:1,
      resizeMode: 'cover',
      justifyContent: 'center',
      alignItems:'center'
    },
    text:{
      alignSelf: 'center',
      justifyContent:'center',
      fontSize:20,
      color:'white',
      fontFamily:'Roboto_700Bold'
    },
    title:{
      alignSelf: 'center',
      justifyContent:'center',
      fontSize:20,
      color:'black',
      fontFamily:'Roboto_700Bold',
    },
    button:{
      padding: 20,
      borderRadius: 30,
      borderWidth: 1,
      width:300,
      alignSelf:'center',
      alignItems:'center',
      opacity:0.95,
      borderColor: 'blue',
      backgroundColor: 'blue',
    
    },
  buttonContainer:{
  
  }}
  );