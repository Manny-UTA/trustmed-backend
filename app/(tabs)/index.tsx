import StickyHeader from '@/components/nav';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuPress = () => {
    setMenuOpen(!menuOpen);
    console.log('Menu pressed');
  };

  const handleLogoPress = () => {
    console.log('Logo pressed');
  };

  return (
    <ThemedView style={styles.container}>
      <StickyHeader onMenuPress={handleMenuPress} onLogoPress={handleLogoPress} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 56 }, 
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/*Hero*/}
        <ThemedView style={styles.heroSection}>
          <Image
            source={require('@/assets/images/health-header.png')}
            style={styles.headerImage}
            contentFit="cover"
          />
          <ThemedView style={styles.heroOverlay}>
            <ThemedView style={styles.badge}>
              <ThemedText style={styles.badgeText}>Research Prototype</ThemedText>
            </ThemedView>

            <ThemedText type="title" style={styles.heroTitle}>
              TrustMed AI – Safer Symptom Intake
            </ThemedText>
            <ThemedText type="default" style={styles.heroSubtitle}>
              An AI-assisted symptom intake tool developed for a university research project.
            </ThemedText>

            <ThemedText type="default" style={styles.heroNote}>
              Not for diagnosis or medical treatment. For research and educational use only.
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/*CTA*/}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Get Started</ThemedText>

          <Link href={'/explore' as any} asChild>
            <Pressable style={styles.primaryCard}>
              <ThemedView style={styles.cardIcon}>
                <ThemedText style={styles.iconLarge}>💬</ThemedText>
              </ThemedView>
              <ThemedView style={styles.cardContent}>
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                  Start Symptom Check
                </ThemedText>
                <ThemedText type="default" style={styles.cardDescription}>
                  Chat with TrustMed AI to structure your symptom information.
                </ThemedText>
              </ThemedView>
              <ThemedText style={styles.arrow}>→</ThemedText>
            </Pressable>
          </Link>
        </ThemedView>

        {/*Tut*/}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">How this prototype works</ThemedText>

          <ThemedView style={styles.howList}>
            <ThemedView style={styles.howCard}>
              <ThemedText style={styles.howTitle}>
                Step 1 – Describe your symptoms
              </ThemedText>
              <ThemedText style={styles.howText}>
                Type your symptoms and basic context into the chat interface.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.howCard}>
              <ThemedText style={styles.howTitle}>
                Step 2 – AI organizes your information
              </ThemedText>
              <ThemedText style={styles.howText}>
                TrustMed AI groups symptoms and risk factors to support safer intake.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.howCard}>
              <ThemedText style={styles.howTitle}>
                Step 3 – Review the summary
              </ThemedText>
              <ThemedText style={styles.howText}>
                You receive a structured summary you could share with a clinician.
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/*About*/}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">About this study</ThemedText>

          <ThemedText style={styles.aboutBody}>
            This interface is part of an individual study project supervised by{' '}
            <ThemedText style={styles.aboutBodyBold}>Professor Jang</ThemedText>. The goal is
            to explore how AI can support safer, more structured symptom intake before a clinical
            encounter.
          </ThemedText>

          <ThemedView style={styles.bulletList}>
            <ThemedText style={styles.bulletItem}>
              • This is not a medical device.
            </ThemedText>
            <ThemedText style={styles.bulletItem}>
              • It does not replace a doctor or emergency care.
            </ThemedText>
            <ThemedText style={styles.bulletItem}>
              • Do not use it for urgent or life-threatening symptoms.
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/*Health Resources*/}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Health Resources</ThemedText>

          <Link href={'/resources' as any} asChild>
            <Pressable style={styles.resourceCard}>
              <ThemedView style={styles.resourceLeft}>
                <ThemedText style={styles.resourceIcon}></ThemedText>
                <ThemedView>
                  <ThemedText type="defaultSemiBold">Health FAQs</ThemedText>
                  <ThemedText type="default" style={styles.resourceDesc}>
                    Common telehealth questions
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </Pressable>
          </Link>

          <Link href={'/resources' as any} asChild>
            <Pressable style={styles.resourceCard}>
              <ThemedView style={styles.resourceLeft}>
                <ThemedText style={styles.resourceIcon}></ThemedText>
                <ThemedView>
                  <ThemedText type="defaultSemiBold">Health Articles</ThemedText>
                  <ThemedText type="default" style={styles.resourceDesc}>
                    Trusted medical information
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </Pressable>
          </Link>

          <Link href={'/resources' as any} asChild>
            <Pressable style={styles.resourceCard}>
              <ThemedView style={styles.resourceLeft}>
                <ThemedText style={styles.resourceIcon}></ThemedText>
                <ThemedView>
                  <ThemedText type="defaultSemiBold">Wellness Tips</ThemedText>
                  <ThemedText type="default" style={styles.resourceDesc}>
                    Daily health recommendations
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </Pressable>
          </Link>
        </ThemedView>

        <ThemedView style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
}


/*TypeScript Styling*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    position: 'relative',
    marginBottom: 24,
  },
  headerImage: {
    width: '100%',
    height: 240,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(224, 242, 254, 0.95)',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  heroTitle: {
    color: '#FFFFFF',
    marginBottom: 4,
    fontSize: 26,
    lineHeight: 30,
  },
  heroSubtitle: {
    color: '#FFFFFF',
    opacity: 0.95,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  heroNote: {
    color: '#E5E7EB',
    fontSize: 11,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#10B981',
    borderRadius: 16,
    marginTop: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconLarge: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 13,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 24,
    marginLeft: 8,
  },
  howList: {
    marginTop: 12,
    gap: 12,
  },
  howCard: {
    padding: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  howTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  howText: {
    fontSize: 13,
    opacity: 0.8,
  },
  aboutBody: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  aboutBodyBold: {
    fontSize: 13,
    fontWeight: '600',
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.85,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  resourceIcon: {
    fontSize: 24,
  },
  resourceDesc: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 20,
  },
});
