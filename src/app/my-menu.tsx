
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
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

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const saved = await AsyncStorage.getItem('menuItems');
      const data = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(data)) {
        throw new Error('Invalid menu data');
      }

      setItems(data);
    } catch {
      setError('Could not load your menu. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  // Delete a dish from the menu
  const deleteItem = async (id: string) => {
    try {
      const updatedItems = items.filter(
        (item) => item.id !== id
      );

      await AsyncStorage.setItem(
        'menuItems',
        JSON.stringify(updatedItems)
      );

      setItems(updatedItems);
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Could not delete the menu item.');
      } else {
        Alert.alert('Error', 'Could not delete the menu item.');
      }
    }
  };

  const confirmDelete = (item: MenuItem) => {
    const message = `Are you sure you want to delete ${item.name}?`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        deleteItem(item.id);
      }
    } else {
      Alert.alert('Delete Menu Item', message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteItem(item.id),
        },
      ]);
    }
  };

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
          <Pressable style={styles.button} onPress={loadItems}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.dishName}>
                  {item.name}
                </Text>
                <Text style={styles.price}>
                  R{Number(item.price).toFixed(2)}
                </Text>
              </View>

              <Text style={styles.course}>{item.course}</Text>

              <Text style={styles.description}>
                {item.description}
              </Text>

              <View style={styles.actions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() =>
                    router.push(
                      `/add-menu?id=${encodeURIComponent(item.id)}`
                    )
                  }
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(item)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
              </View>
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#285439',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#A33D36',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
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
