
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput
} from 'react-native';

export default function AddMenuScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  // Show messages on both web and mobile
  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Validate and save the dish
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
      // Get previously saved dishes
      const savedData = await AsyncStorage.getItem('menuItems');
      const existingItems = savedData ? JSON.parse(savedData) : [];

      if (!Array.isArray(existingItems)) {
        throw new Error('Invalid saved menu data');
      }

      // Create the new dish
      const newItem = {
        id: Date.now().toString() + Math.random().toString(),
        name: name.trim(),
        description: description.trim(),
        course: course,
        price: amount,
      };

      // Add the new dish to the existing list
      const updatedItems = [...existingItems, newItem];

      // Save all dishes using AsyncStorage
      await AsyncStorage.setItem(
        'menuItems',
        JSON.stringify(updatedItems)
      );

      // Display confirmation
      showMessage(
        'Success!',
        'Menu item successfully added!'
      );

      // Open My Menu
      router.replace('/my-menu');

    } catch (error) {
      showMessage(
        'Error',
        'Could not save the menu item. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Add Menu Item</Text>
      <Text style={styles.subtitle}>
        Enter your dish details below.
      </Text>

      {/* Dish Name */}
      <Text style={styles.label}>Dish Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Grilled Chicken"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.description]}
        placeholder="Describe your dish"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Course Selection */}
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

      {/* Price */}
      <Text style={styles.label}>Price (R)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 120.00"
        placeholderTextColor="#888"
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />

      {/* Save Button */}
      <Pressable
        style={[
          styles.saveButton,
          saving && styles.disabledButton,
        ]}
        onPress={saveItem}
        disabled={saving}
      >
        <Text style={styles.whiteText}>
          {saving ? 'Saving...' : 'Save Menu Item'}
        </Text>
      </Pressable>

      {/* Back Button */}
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Back</Text>
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
