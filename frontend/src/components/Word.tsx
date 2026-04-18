import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface WordProps {
  text: string;
  onPress: (word: string) => void;
  isSelected?: boolean;
}

export const Word: React.FC<WordProps> = ({ text, onPress, isSelected }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.selectedContainer]} 
      onPress={() => onPress(text)}
    >
      <Text style={[styles.text, isSelected && styles.selectedText]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginHorizontal: 1,
    borderRadius: 4,
  },
  selectedContainer: {
    backgroundColor: '#ffd33d',
  },
  text: {
    fontSize: 24,
    fontFamily: 'Amiri_400Regular',
    color: '#fff',
    textAlign: 'center',
  },
  selectedText: {
    color: '#000',
  },
});
