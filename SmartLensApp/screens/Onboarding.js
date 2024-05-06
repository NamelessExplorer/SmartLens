import React from 'react'
import Onboarding from 'react-native-onboarding-swiper';
import LottieView from 'lottie-react-native'
import { Button, ImageBackground, StyleSheet, TouchableOpacity, Pressable, Text, View, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const {width, height} = Dimensions.get('window');

export default function OnboardingScreen() {

    const navigation = useNavigation();

    const handleDone = () => {
        navigation.navigate('Scan');
    }

    const handleSkip = () => {

    }

    const doneButton = ({...props}) => {
        return (
            <TouchableOpacity style={styles.doneButton} {...props}>
                <Text>Done</Text>
            </TouchableOpacity>
        )
    } 
    
    return (
        <View style={styles.container}>
            <Onboarding
                onDone={handleDone}
                onSkip={handleSkip}
                DoneButtonComponent={doneButton}
                containerStyles={{paddingHorizontal:15}}
                pages={[
                {
                backgroundColor: '#ffffff',
                image: (
                    <View style={styles.lottie}>
                        <LottieView style={{flex:1}} source={require('../assets/animation1.json')} autoPlay loop />
                    </View>
                ),
                title: 'Welcome to SmartLens',
                subtitle: 'A trusted digital solution for medical information',
                },
                {
                    backgroundColor: 'purple',
                    image: (
                        <View style = {styles.lottie}>
                            <LottieView style={{flex:1}} source={require('../assets/animation4.json')} autoPlay loop />
                        </View>
                    ),
                    title: 'Find all you need with just a snap',
                    subtitle: 'Smartlens browses all the latest information you need to know about your product'
                },
                {
                    backgroundColor: 'yellow',
                    image: (
                        <View style = {styles.lottie}>
                            <LottieView style={{flex:1}} source={require('../assets/animation3.json')} autoPlay loop />
                        </View>
                    ),
                    title: 'Still Under Development',
                    subtitle: 'We are working to bring the most optimal features to enhance your user experience'
                }

                ]}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    lottie:{
        width: width*0.9,
        height:width
    },
    doneButton:{
        padding:20,
        backgroundColor:'white',
        borderTopLeftRadius:100,
        borderBottomLeftRadius:100
    }
});
  