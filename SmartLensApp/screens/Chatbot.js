import axios from 'axios';
import ChatBubble from './ChatBubble';
import {speak, isSpeakingAsync, stop} from "expo-speech"
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { ActivityIndicator, Touchable } from 'react-native';

const ChatBot = () => {

    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, SetError] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const API_KEY = "########################";

    const handleUserInput = async() => {
        
        let updatedChat = [
            ...chat,
            {
                role:"user",
                parts: [{text:userInput}],
            },
        ];

        setLoading(true);

        try{
            const response = await axios.post(
                'http://192.168.29.170:5000/chat', 
                {
                    contents: updatedChat,
                }
            );

            console.log("LLM API Response: ", response.data)

            const modelResponse = response?.data?.[0]?.content?.parts?.[0]?.text || "";

            if(modelResponse){

                const updatedChatWithModel = [
                    ...updatedChat,
                    {
                        role: "model",
                        parts: [{ text: modelResponse}],
                    },
                ];

                setChat(updatedChatWithModel);
                setUserInput("");
            }
        }
        catch(error){
            console.log("Error calling the LLM API: ", error);
            console.log("Error response: ", error.response);
            SetError("An error occurred. Please try again.");
        }
        finally{
            setLoading(false);
        }
    }

    const handleSpeech = async(text) => {
        if(isSpeaking){
            stop();
            setIsSpeaking(false);
        } else{
            if(!(await isSpeakingAsync())){
                speak(text);
                setIsSpeaking(true);
            }
        }
    }


return renderChatItem = ({item}) => (
    <ChatBubble
        role={item.role}
        text = {item.parts[0].text}
        onSpeech={() => {handleSpeech(item.parts[0].text)}}
    />
);

return (
    <View style={styles.container}>
        <Text style={styles.title}> LLM ChatBot</Text>
        <FlatList 
        data={chat}
        renderItem={renderChatItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.container}
        />

        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder= "Type your message..."
                placeholderTextColor="#aaa"
                value={userInput}
                onChangeText={setUserInput}
            />
            <TouchableOpacity style={styles.button} onPress={handleUserInput}>
                <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator style={styles.loading} color="#333"/>}
        {error && <Text style={styles.error}>{error}</Text>}
    </View>
);
};


const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8'
    },
    title:{
        fontSize:24,
        fontWeight: "bold",
        color:"#333",
        marginBottom: 20,
        marginTop: 40,
        textAlign: "center"
    },
    charContainer:{
        flexGrow: 1,
        justifyContent: "flexend",
    },
    inputContainer:{
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    input:{
        flex:1,
        height: 50,
        marginRight: 10,
        padding: 8,
        borderColor: "#333",
        borderWidth: 1,
        borderRadius: 25,
        color: "#333",
        backgroundColor:"#fff",
    },
    button:{
        padding:10,
        backgroundColor:"#007AFF",
        borderRadius:25,
    },
    buttonText:{
        color:"#fff",
        textAlign: "center"
    },
    loading: {
        marginTop:10,
    },
    error:{
        color:"red",
        marginTop:10,
    },
});

export default ChatBot;