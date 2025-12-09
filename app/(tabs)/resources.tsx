///Simple Mockup page, no important code here///
////////////////////////////////////////////////
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export default function ResourcesScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F4EDE4', dark: '#2A2A2A' }}
      headerImage={
        <IconSymbol
          size={220}
          color="#8B5CF6"
          name="book.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Resources
        </ThemedText>
      </ThemedView>
      <ThemedText>
        Access articles, FAQs, and educational content to better understand telehealth and AI-driven healthcare.
      </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -60,
    left: -10,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
});
