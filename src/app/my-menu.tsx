
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  course: string;
  price: number;
};

export default function MyMenuScreen() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadItems = async () => {
        setLoading(true);
        setError('');

        try {
          const saved = await AsyncStorage.getItem('menuItems');
          const data = saved ? JSON.parse(saved) : [];

          if (!Array.isArray(data)) {
            throw new Error('Invalid menu data');
          }

          if (active) {
            setItems(data);
          }
        } catch (e) {
          if (active) {
            setError('Could not load your menu. Please try again.');
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadItems();

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Menu</Text>
        <Text style={styles.subtitle}>
          {items.length} menu items
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#285439"
          style={styles.center}
        />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text style={styles.price}>
                  R{Number(item.price).toFixed(2)}
                </Text>
              </View>

              <Text style={styles.course}>{item.course}</Text>
              <Text style={styles.description}>
                {item.description}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                No Menu Items Yet
              </Text>
              <Text style={styles.emptyText}>
                Your menu is empty. Add your first dish!
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() => router.push('/add-menu')}
        >
          <Text style={styles.buttonText}>+ Add Menu Item</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.back}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  header: {
    backgroundColor: '#285439',
    padding: 28,
    paddingTop: 55,
    paddingBottom: 35,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#E4E9DF',
    fontSize: 15,
    marginTop: 8,
  },
  list: {
    padding: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  dishName: {
    color: '#285439',
    fontSize: 19,
    fontWeight: 'bold',
    flex: 1,
  },
  price: {
    color: '#285439',
    fontSize: 17,
    fontWeight: 'bold',
  },
  course: {
    color: '#50805E',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8,
  },
  description: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 75,
  },
  emptyTitle: {
    color: '#285439',
    fontSize: 23,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#666666',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  button: {
    backgroundColor: '#285439',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  back: {
    color: '#285439',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 18,
  },
});

