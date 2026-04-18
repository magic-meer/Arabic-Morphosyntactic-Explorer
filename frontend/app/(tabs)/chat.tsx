import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendChatMessage, ChatMessage } from '@/services/api';
import { theme } from '@/constants/theme';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        role: 'assistant', 
        content: `As-salamu alaykum! I'm your Arabic AI Tutor. Ask me any general questions about Arabic grammar, morphology, or syntax.` 
      }]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(input, newMessages);
      const assistantMsg: ChatMessage = { role: 'assistant', content: response.response };
      setMessages([...newMessages, assistantMsg]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI Pedagogical Tutor</Text>
        <Text style={styles.subtitle}>المعلم الذكي</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((item, index) => (
          <View key={index.toString()} style={[
            styles.messageContainer, 
            item.role === 'user' ? styles.userMessage : styles.assistantMessage
          ]}>
            <Text style={[
              styles.messageText,
              item.role === 'user' ? styles.userText : styles.assistantText
            ]}>
              {item.content}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything / اسأل عن أي شيء..."
          placeholderTextColor={theme.colors.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!input.trim() || loading) && styles.disabledButton]} 
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.black} size="small" />
          ) : (
            <Ionicons name="send" size={20} color={theme.colors.black} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilies.englishBold,
  },
  subtitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.arabic,
    marginTop: theme.spacing.xs,
  },
  messageList: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  messageContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.english,
    lineHeight: 24,
  },
  userText: {
    color: theme.colors.black,
  },
  assistantText: {
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    maxHeight: 120,
    fontFamily: theme.typography.fontFamilies.english,
    minHeight: 40,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.surfaceBorder,
  },
});
