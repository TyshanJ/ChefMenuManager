
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  course: string;
  price: number;
};

const courses = ['All', 'Starter', 'Main Course', 'Dessert'];

export default function MyMenuScreen() {
  const router = useRouter();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');

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

  // Calculate menu statistics
  const totalItems = items.length;

  const averagePrice =
    totalItems > 0
      ? items.reduce(
          (total, item) => total + Number(item.price || 0),
          0
        ) / totalItems
      : 0;

  const starterCount = items.filter(
    (item) => item.course === 'Starter'
  ).length;

  const mainCount = items.filter(
    (item) => item.course === 'Main Course'
  ).length;

  const dessertCount = items.filter(
    (item) => item.course === 'Dessert'
  ).length;

  // Search and filter dishes
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const dishName = String(item.name || '').toLowerCase();
      const searchText = search.trim().toLowerCase();

      const matchesSearch = dishName.includes(searchText);

      const matchesCourse =
        selectedCourse === 'All' ||
        item.course === selectedCourse;

      return matchesSearch && matchesCourse;
    });
  }, [items, search, selectedCourse]);

  // Delete a dish
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

  // Confirm before deleting
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
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
        <>
          {/* Menu Statistics */}
          <View style={styles.statistics}>
            <Text style={styles.sectionTitle}>Menu Statistics</Text>

            <View style={styles.statRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalItems}</Text>
                <Text style={styles.statLabel}>Total Dishes</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  R{averagePrice.toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>Average Price</Text>
              </View>
            </View>

            <View style={styles.courseStats}>
              <Text style={styles.courseStatText}>
                Starters: {starterCount}
              </Text>
              <Text style={styles.courseStatText}>
                Main Courses: {mainCount}
              </Text>
              <Text style={styles.courseStatText}>
                Desserts: {dessertCount}
              </Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchLabel}>Search Menu</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Type a dish name..."
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          </View>

          {/* Course Filters */}
          <View style={styles.filterContainer}>
            <Text style={styles.searchLabel}>Filter by Course</Text>

            <View style={styles.filterButtons}>
              {courses.map((course) => (
                <Pressable
                  key={course}
                  style={[
                    styles.filterButton,
                    selectedCourse === course && styles.activeFilter,
                  ]}
                  onPress={() => setSelectedCourse(course)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedCourse === course &&
                        styles.activeFilterText,
                    ]}
                  >
                    {course}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.clearButton}
              onPress={() => {
                setSearch('');
                setSelectedCourse('All');
              }}
            >
              <Text style={styles.clearText}>
                Clear Search & Filter
              </Text>
            </Pressable>
          </View>

          {/* Menu Items */}
          <View style={styles.list}>
            {filteredItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                  {items.length === 0
                    ? 'No Menu Items Yet'
                    : 'No Matching Dishes'}
                </Text>
                <Text style={styles.emptyText}>
                  {items.length === 0
                    ? 'Add your first dish to get started.'
                    : 'Check the spelling or clear your search and filter.'}
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => (
                <View style={styles.card} key={item.id}>
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
              ))
            )}
          </View>
        </>
      )}

      {/* Footer */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#285439',
    padding: 28,
    paddingTop: 55,
    paddingBottom: 25,
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
  statistics: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionTitle: {
    color: '#285439',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    color: '#285439',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666666',
    fontSize: 13,
    marginTop: 5,
  },
  courseStats: {
    backgroundColor: '#E5EDE4',
    padding: 13,
    borderRadius: 10,
    marginTop: 10,
    gap: 5,
  },
  courseStatText: {
    color: '#285439',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  searchLabel: {
    color: '#285439',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    color: '#222222',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#285439',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  activeFilter: {
    backgroundColor: '#285439',
  },
  filterText: {
    color: '#285439',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
  },
  clearText: {
    color: '#50805E',
    fontWeight: 'bold',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  list: {
    padding: 20,
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
    marginTop: 30,
    marginBottom: 30,
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
