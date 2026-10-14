
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.smallTitle}>RESTAURANT APP</Text>
        <Text style={styles.title}>Chef Menu Manager</Text>
        <Text style={styles.subtitle}>
          Manage your restaurant menu easily.
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Welcome, Chef!</Text>
        <Text style={styles.description}>
          Create and manage your restaurant's menu items.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/add-menu')}
        >
          <Text style={styles.buttonText}>+ Add Menu Item</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/my-menu')}
        >
          <Text style={styles.secondaryText}>View Menu</Text>
        </Pressable>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>MENU MANAGEMENT</Text>
          <Text style={styles.cardText}>
            Add dishes, choose their course, set prices,
            and view your restaurant menu.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  header: {
    backgroundColor: '#285439',
    padding: 30,
    paddingTop: 65,
    paddingBottom: 50,
  },
  smallTitle: {
    color: '#D8E4D6',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 15,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#E4E9DF',
    fontSize: 14,
    marginTop: 12,
  },
  content: {
    padding: 24,
  },
  heading: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#285439',
    marginBottom: 10,
  },
  description: {
    color: '#666666',
    fontSize: 15,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#285439',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#285439',
  },
  secondaryText: {
    color: '#285439',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 14,
    marginTop: 35,
  },
  cardTitle: {
    color: '#285439',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 23,
  },
});
