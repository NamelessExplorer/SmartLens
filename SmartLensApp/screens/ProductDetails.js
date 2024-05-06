import {React,useState} from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { SearchBar } from '@rneui/themed';
import {useFonts} from '@expo-google-fonts/outfit';


export default function ProductDetails(){

    const [search, setSearch] = useState("");

    const updateSearch = (search) => {
    setSearch(search);
    };

    let [fontsLoaded, fontError] = useFonts({
        'OutfitVariable':require('../assets/fonts/Outfit/Outfit-VariableFont_wght.ttf')
    });

      if (!fontsLoaded) {
        return null;
      }
      else{

    return(
            <View style={styles.result}>
                <Text style={{fontSize:20, fontFamily:'OutfitVariable', color:'white', fontWeight:900, alignSelf:'center', paddingTop:5}}>Product Details</Text>
                <Text/>
                <Text/>
                <Text/>
                <Text/>
                <Text/>
                <Text style={styles.text}>Product: Kuffdryl</Text>
        
                <Text/>
                <Text style={styles.text}>Use Case: For cough</Text>
                <Text/>
                <Text style={styles.text}>Age Restriction: Not recommended for children under 16</Text>
                <Text/>
                <Text style={styles.text}>Precautions: #########</Text>
                <Text/>
                <Text/>
                <Text/>
                <Text/>
                <Text>Want to know more?</Text>
                <SearchBar
                placeholder="What else do you want to know?"
                onChangeText={updateSearch}
                value={search}
                />
                <Text/>
            
            </View>
        
    )
}
}

const styles = StyleSheet.create({

    result:{
        marginTop:-30,
        borderTopLeftRadius:30, 
        borderTopRightRadius:30,
        padding:30,
        backgroundColor:'#3b3c44'
    },
    text:{
        alignSelf: 'center',
        justifyContent:'center',
        fontSize:17,
        color:'white',
        fontFamily:'OutfitVariable'
    }
})