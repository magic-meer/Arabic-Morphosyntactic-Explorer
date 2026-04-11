// Arabic Morphosyntactic Explorer - ChatBubble Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ChatMessage } from '@/types';
import { COLORS } from '../utils/constants';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.content,
            isUser ? styles.userContent : styles.assistantContent,
          ]}
        >
          {message.content}
        </Text>
      </View>
      {message.context_verses && message.context_verses.length > 0 && (
        <View style={styles.context}>
          {message.context_verses.map((verse, index) => (
            <Text key={index} style={styles.contextText}>
              {verse.chapter}:{verse.verse}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
  },
  assistantBubble: {
    backgroundColor: COLORS.surface,
  },
  content: {
    fontSize: 16,
  },
  userContent: {
    color: COLORS.background,
  },
  assistantContent: {
    color: COLORS.text,
  },
  context: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  contextText: {
    fontSize: 12,
    color: COLORS.secondary,
  },
});