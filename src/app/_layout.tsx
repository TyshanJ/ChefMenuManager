
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#285439',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="add-menu"
        options={{ title: 'Add Menu Item' }}
      />
      <Stack.Screen
        name="my-menu"
        options={{ title: 'My Menu' }}
      />
    </Stack>
  );
}
