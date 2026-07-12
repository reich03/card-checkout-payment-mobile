import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { spacing } from '../theme/colors';

export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton width="100%" height={56} style={styles.block} />
      <Skeleton width="100%" height={176} style={styles.block} />
      <View style={styles.sectionTitle}>
        <Skeleton width={180} height={24} />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((key) => (
          <View key={key} style={styles.card}>
            <Skeleton width="100%" height={140} borderRadius={0} />
            <View style={styles.cardBody}>
              <Skeleton width="80%" height={18} style={styles.gap} />
              <Skeleton width="50%" height={22} style={styles.gap} />
              <Skeleton width="100%" height={36} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
  },
  block: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardBody: {
    padding: 12,
  },
  gap: {
    marginBottom: 10,
  },
});
