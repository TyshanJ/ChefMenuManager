
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  course: string;
  price: number;
};

export default function AddMenuScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const editId = typeof id === 'string' ? id : undefined;
  const isEditing = Boolean(editId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Load the existing dish when editing
  useEffect(() => {
    if (!editId) return;

    const loadItem = async () => {
      try {
        const saved = await AsyncStorage.getItem('menuItems');
        const items: MenuItem[] = saved ? JSON.parse(saved) : [];

        const item = items.find((dish) => dish.id === editId);

        if (!item) {
          showMessage('Error', 'Menu item could not be found.');
          router.replace('/my-menu');
          return;
        }

        setName(item.name);
        setDescription(item.description);
        setCourse(item.course);
        setPrice(String(item.price));
      } catch {
        showMessage('Error', 'Could not load the menu item.');
        router.replace('/my-menu');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [editId]);

  const saveItem = async () => {
    if (
      !name.trim() ||
      !description.trim() ||
      !course ||
      !price.trim()
    ) {
      showMessage(
        'Missing Information',
        'Please complete all fields before saving.'
      );
      return;
    }

    if (!['Starter', 'Main Course', 'Dessert'].includes(course)) {
      showMessage('Invalid Course', 'Please select a valid course.');
      return;
    }

    const amount = Number(price.trim().replace(',', '.'));

    if (!Number.isFinite(amount) || amount <= 0) {
      showMessage(
        'Invalid Price',
        'Please enter a valid price greater than zero.'
      );
      return;
    }

    setSaving(true);

    try {
      const saved = await AsyncStorage.getItem('menuItems');
      const existingItems: MenuItem[] = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(existingItems)) {
        throw new Error('Invalid menu data');
      }

      let updatedItems: MenuItem[];

      if (isEditing) {
        const exists = existingItems.some(
          (item) => item.id === editId
        );

        if (!exists) {
          throw new Error('Menu item not found');
        }

        updatedItems = existingItems.map((item) =>
          item.id === editId
            ? {
                ...item,
                name: name.trim(),
                description: description.trim(),
                course,
                price: amount,
              }
            : item
        );
      } else {
        const newItem: MenuItem = {
          id: Date.now().toString() + Math.random().toString(),
          name: name.trim(),
          description: description.trim(),
          course,
          price: amount,
        };

        updatedItems = [...existingItems, newItem];
      }

      await AsyncStorage.setItem(
        'menuItems',
        JSON.stringify(updatedItems)
      );

      showMessage(
        'Success!',
        isEditing
          ? 'Menu item successfully updated!'
          : 'Menu item successfully added!'
      );

      router.replace('/my-menu');
    } catch {
      showMessage(
        'Error',
        'Could not save the menu item. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Loading menu item...</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
      </Text>

      <Text style={styles.subtitle}>
        {isEditing
          ? 'Update your dish details below.'
          : 'Enter your dish details below.'}
      </Text>

      <Text style={styles.label}>Dish Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Grilled Chicken"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.description]}
        placeholder="Describe your dish"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Select Course</Text>

      {['Starter', 'Main Course', 'Dessert'].map((item) => (
        <Pressable
          key={item}
          style={[
            styles.courseButton,
            course === item && styles.selected,
          ]}
          onPress={() => setCourse(item)}
        >
          <Text
            style={
              course === item
                ? styles.whiteText
                : styles.greenText
            }
          >
            {item}
          </Text>
        </Pressable>
      ))}

      <Text style={styles.label}>Price (R)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 120.00"
        placeholderTextColor="#888"
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />

      <Pressable
        style={[
          styles.saveButton,
          saving && styles.disabledButton,
        ]}
        onPress={saveItem}
        disabled={saving}
      >
        <Text style={styles.whiteText}>
          {saving
            ? 'Saving...'
            : isEditing
              ? 'Update Menu Item'
              : 'Save Menu Item'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  content: {
    padding: 24,
    paddingBottom: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#285439',
    marginTop: 25,
  },
  subtitle: {
    color: '#666666',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 25,
  },
  label: {
    color: '#285439',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    color: '#222222',
  },
  description: {
    height: 100,
    textAlignVertical: 'top',
  },
  courseButton: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#285439',
    borderRadius: 10,
    marginBottom: 9,
  },
  selected: {
    backgroundColor: '#285439',
  },
  greenText: {
    color: '#285439',
    fontSize: 16,
  },
  whiteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#285439',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  back: {
    color: '#285439',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 16,
  },
});
