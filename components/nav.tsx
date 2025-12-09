///Simple UI component for displaying a sticky header at the top of the screen./////
///Purely visual - no clinical logic or AI features here.///////////////////////////
///Used only to show the TrustMed logo and keep navigation consistent across pages./
////////////////////////////////////////////////////////////////////////////////////
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onMenuPress?: () => void;
  onLogoPress?: () => void;
};

export default function StickyHeader({ onMenuPress, onLogoPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <Pressable onPress={onLogoPress} hitSlop={10} style={styles.left}>
          <Image
            source={require('../assets/images/trustmedlogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute', 
    top: 0,
    left: 60,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 100, 
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  inner: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  right: { paddingLeft: 8 },
  logo: { width: 200, height: 35 }, 
});
