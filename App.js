import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignIn from "./components/SignIn";
import ToDo from "./components/ToDo";
import Credit from "./components/Credit";
import SignOut from "./components/SignOut";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function AppDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="ToDo" component={ToDo} />
      <Drawer.Screen name="Credit" component={Credit} />
      <Drawer.Screen name="SignOut" component={SignOut} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: true }} />
        <Stack.Screen name="AppDrawer" component={AppDrawer} options={{ headerShown: false, gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}