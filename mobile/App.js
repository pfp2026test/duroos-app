import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import DuroosDetailScreen from "./screens/DuroosDetailScreen";
import PlaylistScreen from "./screens/PlaylistScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Duroos" }} />
        <Stack.Screen name="DuroosDetail" component={DuroosDetailScreen} options={{ title: "" }} />
        <Stack.Screen name="Playlist" component={PlaylistScreen} options={{ title: "Series" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
