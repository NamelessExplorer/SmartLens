import {React, useRef} from 'react';
import { View, Image, Dimensions, Text, StyleSheet, ScrollView} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import ProductDetails from './ProductDetails';
import Animated from 'react-native-reanimated';
import {
    useFonts
  } from '@expo-google-fonts/outfit';

  


const {width, height} = Dimensions.get('window');
const IMG_HEIGHT = 300;




const DisplayImageScreen = ({ route }) => {

    
    const { imageUri } = route.params;
    
    let [fontsLoaded, fontError] = useFonts({
        'OutfitVariable':require('../assets/fonts/Outfit/Outfit-VariableFont_wght.ttf')
    });

    if (!fontsLoaded) {
      return null;
    }
    else{
      return (
          <View>
                <Animated.ScrollView showsVerticalScrollIndicator={false}>
                    <Image source={{ uri: imageUri }} style={styles.image} />  
                    <ProductDetails/>
                </Animated.ScrollView>
          </View>
      );
    };
}


export default DisplayImageScreen;

const styles = StyleSheet.create({
    text:{
        alignSelf: 'center',
        justifyContent:'center',
        fontSize:17,
        color:'black',
        fontFamily:'OutfitVariable'
    },
    image:{
      width:width,
      height:IMG_HEIGHT
    }
  })