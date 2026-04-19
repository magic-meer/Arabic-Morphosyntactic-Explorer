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
  ScrollView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendChatMessage, ChatMessage, analyzeVerse } from '@/services/api';
import { theme } from '@/constants/theme';
import { WordInfo } from '@/types/morphology';
import { usePreferences } from '@/context/PreferencesContext';

export default function ChatScreen() {
  const { aiModel } = usePreferences();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Context states
  const [contextText, setContextText] = useState('');
  const [contextAnalysis, setContextAnalysis] = useState<WordInfo[] | null>(null);
  const [analyzingContext, setAnalyzingContext] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        role: 'assistant', 
        content: `As-salamu alaykum! I'm your Arabic AI Tutor. Ask me any general questions about Arabic grammar, morphology, or syntax. You can also paste some Arabic text above to give me direct context!` 
      }]);
    }
  }, []);

  const handleAnalyzeContext = async () => {
    if (!contextText.trim() || analyzingContext) return;
    setAnalyzingContext(true);
    Keyboard.dismiss();
    try {
      const result = await analyzeVerse(contextText);
      setContextAnalysis(result.words);
    } catch (e) {
      console.error(e);
      alert('Failed to analyze context');
    } finally {
      setAnalyzingContext(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      let promptPayload = input;
      // Inject the context in the background if it exists
      if (contextText.trim() && contextAnalysis) {
         const strippedAnalysis = contextAnalysis.map(w => ({ word: w.form, root: w.root, pos: w.features?.pos || w.tag }));
         promptPayload = `Selected Context: ${contextText}\n\nMorphological Metadata:\n${JSON.stringify(strippedAnalysis)}\n\nUser Question: ${input}`;
      } else if (messages.length > 1) {
         const stringifiedHistory = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
         promptPayload = `Conversation History:\n${stringifiedHistory}\n\nUser Question: ${input}`;
      }

      const response = await sendChatMessage(promptPayload, newMessages, undefined, aiModel);
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

      <View style={styles.contextPanel}>
        <Text style={styles.contextLabel}>Paste Arabic Context / لصق النص العربي:</Text>
        <View style={styles.contextInputRow}>
          <TextInput
            style={styles.contextInput}
            placeholder="e.g. بِسْمِ اللَّهِ..."
            placeholderTextColor={theme.colors.textSecondary}
            value={contextText}
            onChangeText={setContextText}
          />
          <TouchableOpacity 
            style={[styles.analyzeBtn, (!contextText.trim() || analyzingContext) && styles.disabledButton]} 
            onPress={handleAnalyzeContext}
            disabled={!contextText.trim() || analyzingContext}
          >
            {analyzingContext ? (
               <ActivityIndicator color={theme.colors.black} size="small" />
            ) : (
               <Text style={styles.analyzeBtnText}>Analyze</Text>
            )}
          </TouchableOpacity>
        </View>
        {contextAnalysis && (
          <Text style={styles.contextSuccess}>✓ Analyzed ({contextAnalysis.length} words)</Text>
        )}
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
  contextPanel: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  contextLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilies.english,
    marginBottom: theme.spacing.sm,
  },
  contextInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  contextInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilies.arabic,
    fontSize: theme.typography.sizes.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    textAlign: 'right',
  },
  analyzeBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  analyzeBtnText: {
    color: theme.colors.black,
    fontFamily: theme.typography.fontFamilies.englishBold,
    fontSize: theme.typography.sizes.sm,
  },
  contextSuccess: {
    color: theme.colors.success,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamilies.english,
    marginTop: theme.spacing.xs,
  },
});
