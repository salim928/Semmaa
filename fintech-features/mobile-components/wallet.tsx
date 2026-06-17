// app/WalletScreen.tsx  (updated)
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useWallet } from '../../context/WalletContext';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  category?: string;
}

const WalletScreen = () => {
  const navigation = useNavigation();
  const { 
    balance: walletBalance, 
    transactions: walletTransactions, 
    refreshing,
    refreshWallet,
    addMoney,
    sendMoney,
    withdrawMoney,
    applyForLoan,
  } = useWallet();

  // useRef for stable Animated.Values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // safe setOptions (expo-router's navigation may not always expose setOptions)
    try {
      (navigation as any).setOptions?.({
        title: 'My Wallet',
        headerStyle: { backgroundColor: '#10b981' },
        headerTintColor: '#fff',
      });
    } catch (e) {
      // ignore if not available
    }

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [navigation, fadeAnim, slideAnim]);

  const handleAddMoney = () => {
    Alert.prompt(
      'Add Money',
      'Enter amount to add (GHS):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (text) => {
            const amount = parseFloat(text || '0');
            if (amount <= 0 || isNaN(amount)) {
              Alert.alert('Invalid Amount', 'Please enter a valid amount');
              return;
            }

            const result = await addMoney(amount, 'mobile_money');
            if (result.success) {
              Alert.alert('Success', `GHS ${amount.toFixed(2)} added to your wallet`);
            } else {
              Alert.alert('Error', result.error || 'Failed to add money');
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleSendMoney = () => {
    Alert.prompt(
      'Send Money',
      'Enter recipient user ID:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (recipientId) => {
            if (!recipientId) {
              Alert.alert('Error', 'Please enter recipient ID');
              return;
            }

            Alert.prompt(
              'Send Money',
              'Enter amount to send (GHS):',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Send',
                  onPress: async (text) => {
                    const amount = parseFloat(text || '0');
                    if (amount <= 0 || isNaN(amount)) {
                      Alert.alert('Invalid Amount', 'Please enter a valid amount');
                      return;
                    }

                    const result = await sendMoney(recipientId, amount);
                    if (result.success) {
                      Alert.alert('Success', `GHS ${amount.toFixed(2)} sent successfully`);
                    } else {
                      Alert.alert('Error', result.error || 'Failed to send money');
                    }
                  },
                },
              ],
              'plain-text',
              '',
              'numeric'
            );
          },
        },
      ],
      'plain-text'
    );
  };

  const handleWithdraw = () => {
    Alert.prompt(
      'Withdraw Money',
      'Enter amount to withdraw (GHS):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (text) => {
            const amount = parseFloat(text || '0');
            if (amount <= 0 || isNaN(amount)) {
              Alert.alert('Invalid Amount', 'Please enter a valid amount');
              return;
            }

            Alert.prompt(
              'Withdraw Money',
              'Enter your mobile money number:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Withdraw',
                  onPress: async (account) => {
                    if (!account) {
                      Alert.alert('Error', 'Please enter account number');
                      return;
                    }

                    const result = await withdrawMoney(amount, 'mobile_money', account);
                    if (result.success) {
                      Alert.alert('Success', `GHS ${amount.toFixed(2)} withdrawal initiated`);
                    } else {
                      Alert.alert('Error', result.error || 'Failed to withdraw');
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleLoanApplication = () => {
    Alert.prompt(
      'Apply for Loan',
      'Enter loan amount (GHS):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (text) => {
            const amount = parseFloat(text || '0');
            if (amount <= 0 || isNaN(amount)) {
              Alert.alert('Invalid Amount', 'Please enter a valid amount');
              return;
            }

            Alert.prompt(
              'Loan Purpose',
              'What will you use this loan for?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Next',
                  onPress: (purpose) => {
                    if (!purpose) {
                      Alert.alert('Error', 'Please enter loan purpose');
                      return;
                    }

                    Alert.prompt(
                      'Loan Duration',
                      'Repayment period (months):',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Apply',
                          onPress: async (durationText) => {
                            const duration = parseInt(durationText || '0', 10);
                            if (duration <= 0 || isNaN(duration)) {
                              Alert.alert('Invalid Duration', 'Please enter valid duration');
                              return;
                            }

                            const result = await applyForLoan(amount, purpose, duration);
                            if (result.success) {
                              Alert.alert(
                                'Application Submitted',
                                'Your loan application has been submitted and is under review. You will be notified once approved.'
                              );
                            } else {
                              Alert.alert('Error', result.error || 'Failed to submit loan application');
                            }
                          },
                        },
                      ],
                      'plain-text',
                      '',
                      'numeric'
                    );
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const formatCurrency = (amount: number) =>
    `GHS ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'sales': return 'trending-up';
      case 'inputs': return 'cart';
      case 'loan': return 'document-text';
      default: return 'cash';
    }
  };

  const ActionButton = ({ icon, label, onPress, gradient, disabled = false }: { icon: string; label: string; onPress: () => void; gradient: string[]; disabled?: boolean; }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={styles.actionButton} activeOpacity={0.9}>
      <LinearGradient colors={disabled ? ['#e5e7eb', '#d1d5db'] : gradient} style={styles.actionButtonGradient}>
        <View style={styles.actionIconWrapper}><Ionicons name={icon as any} size={22} color="#fff" /></View>
        <Text style={styles.actionButtonText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const TransactionItem = ({ transaction, index }: { transaction: Transaction; index: number }) => {
    const itemAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(itemAnim, { toValue: 1, duration: 500, delay: index * 80, useNativeDriver: true }).start();
    }, [itemAnim, index]);

    return (
      <Animated.View style={{ opacity: itemAnim, transform: [{ translateY: itemAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <TouchableOpacity style={styles.transactionCard} activeOpacity={0.9}>
          <View style={styles.transactionLeft}>
            <View style={[styles.transactionIconBox, { backgroundColor: transaction.type === 'credit' ? '#dcfce7' : '#fee2e2' }]}>
              <Ionicons name={getCategoryIcon(transaction.category) as any} size={18} color={transaction.type === 'credit' ? '#16a34a' : '#ef4444'} />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDesc} numberOfLines={1}>{transaction.description}</Text>
              <View style={styles.transactionMeta}>
                <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                {transaction.status === 'pending' && <View style={styles.pendingBadge}><Text style={styles.pendingText}>Pending</Text></View>}
              </View>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color: transaction.type === 'credit' ? '#16a34a' : '#374151' }]}>
              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const headerScale = scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.96], extrapolate: 'clamp' });

  // compute pattern circle positions (pixel values) instead of percent strings
  const circlePositions = [
    { right: Math.round(width * 0.06), top: 12 },
    { right: Math.round(width * 0.28), top: 36 },
    { right: Math.round(width * 0.52), top: 16 },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === 'android' ? 12 : 0 }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: headerScale }], zIndex: 10 }}>
            <LinearGradient colors={['#10b981', '#059669', '#047857']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
              {/* Pattern overlay (absolute circles) */}
              <View pointerEvents="none" style={styles.patternOverlay}>
                {circlePositions.map((pos, i) => (
                  <View key={i} style={[styles.patternCircle, { right: pos.right, top: pos.top }]} />
                ))}
              </View>

              <View style={styles.balanceContent}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <TouchableOpacity style={styles.balanceMenuBtn}><Ionicons name="ellipsis-vertical" size={18} color="#fff" /></TouchableOpacity>
                </View>

                <Text style={styles.balanceValue}>{formatCurrency(walletBalance.balance)}</Text>

                <View style={styles.balanceChange}><Ionicons name="trending-up" size={14} color="#86efac" /><Text style={styles.balanceChangeText}>+12.5% from last month</Text></View>

                <View style={styles.actionButtonsContainer}>
                  <View style={styles.actionButtonWrap}><ActionButton icon="add" label="Add Money" gradient={['#8b5cf6', '#7c3aed']} onPress={handleAddMoney} /></View>
                  <View style={styles.actionButtonWrap}><ActionButton icon="send" label="Send" gradient={['#ec4899', '#db2777']} onPress={handleSendMoney} /></View>
                  <View style={styles.actionButtonWrap}><ActionButton icon="download" label="Withdraw" gradient={['#3b82f6', '#2563eb']} onPress={handleWithdraw} /></View>
                  <View style={styles.actionButtonWrap}><ActionButton icon="document-text" label="Loan" gradient={['#f59e0b', '#d97706']} onPress={handleLoanApplication} /></View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Stats Cards */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.9}>
              <LinearGradient colors={['#dcfce7', '#d9f99d']} style={styles.statGradient}>
                <View style={styles.statIcon}><Ionicons name="trending-up" size={22} color="#16a34a" /></View>
                <Text style={styles.statLabel}>This Month Income</Text>
                <Text style={styles.statValue}>{formatCurrency(walletBalance.monthly_income)}</Text>
                <View style={styles.statTrend}><Ionicons name="arrow-up" size={12} color="#16a34a" /><Text style={styles.statTrendText}>+18%</Text></View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} activeOpacity={0.9}>
              <LinearGradient colors={['#fee2e2', '#fecaca']} style={styles.statGradient}>
                <View style={styles.statIcon}><Ionicons name="trending-down" size={22} color="#ef4444" /></View>
                <Text style={styles.statLabel}>This Month Expenses</Text>
                <Text style={styles.statValue}>{formatCurrency(walletBalance.monthly_expenses)}</Text>
                <View style={styles.statTrend}><Ionicons name="arrow-down" size={12} color="#16a34a" /><Text style={[styles.statTrendText, { color: '#16a34a' }]}>-5%</Text></View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Financial Services */}
          <View style={styles.servicesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Financial Services</Text>
              <TouchableOpacity><Text style={styles.seeAll}>Explore →</Text></TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
              <TouchableOpacity style={styles.serviceCard} activeOpacity={0.9}>
                <LinearGradient colors={['#fef3c7', '#fde68a']} style={styles.serviceGradient}>
                  <Ionicons name="shield-checkmark" size={28} color="#f59e0b" />
                  <Text style={styles.serviceTitle}>Crop Insurance</Text>
                  <Text style={styles.serviceDesc}>Protect your harvest</Text>
                  <View style={styles.comingSoonBadge}><Text style={styles.comingSoonText}>Coming Soon</Text></View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.serviceCard, { marginLeft: 12 }]} activeOpacity={0.9}>
                <LinearGradient colors={['#dbeafe', '#bfdbfe']} style={styles.serviceGradient}>
                  <Ionicons name="calculator" size={28} color="#3b82f6" />
                  <Text style={styles.serviceTitle}>Micro Loans</Text>
                  <Text style={styles.serviceDesc}>Quick farming loans</Text>
                  <View style={styles.comingSoonBadge}><Text style={styles.comingSoonText}>Coming Soon</Text></View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.serviceCard, { marginLeft: 12 }]} activeOpacity={0.9}>
                <LinearGradient colors={['#fce7f3', '#fbcfe8']} style={styles.serviceGradient}>
                  <Ionicons name="trending-up" size={28} color="#ec4899" />
                  <Text style={styles.serviceTitle}>Investments</Text>
                  <Text style={styles.serviceDesc}>Grow your money</Text>
                  <View style={styles.comingSoonBadge}><Text style={styles.comingSoonText}>Coming Soon</Text></View>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
            </View>

            <View style={styles.filterTabs}>
              <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}><Text style={styles.filterTabTextActive}>All</Text></TouchableOpacity>
              <TouchableOpacity style={styles.filterTab}><Text style={styles.filterTabText}>Income</Text></TouchableOpacity>
              <TouchableOpacity style={styles.filterTab}><Text style={styles.filterTabText}>Expenses</Text></TouchableOpacity>
              <TouchableOpacity style={styles.filterTab}><Text style={styles.filterTabText}>Pending</Text></TouchableOpacity>
            </View>

            <View style={styles.transactionsList}>
              {walletTransactions.map((t, idx) => <TransactionItem key={t.id} transaction={{...t, date: new Date(t.created_at)}} index={idx} />)}
            </View>
          </View>

          {/* Referral Banner */}
          <View style={styles.referralSection}>
            <LinearGradient colors={['#8b5cf6', '#7c3aed', '#6d28d9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.referralCard}>
              <View style={styles.referralContent}>
                <View style={styles.referralLeft}>
                  <View style={styles.referralBadge}><Text style={styles.referralBadgeText}>EARN REWARDS</Text></View>
                  <Text style={styles.referralTitle}>Refer & Earn</Text>
                  <Text style={styles.referralText}>Invite farmers to join and earn GHS 50 for each successful referral</Text>
                  <TouchableOpacity style={styles.referralButton} onPress={() => Alert.alert('Referral Program', 'Share your referral code with other farmers to earn rewards!')}>
                    <Text style={styles.referralButtonText}>Start Earning</Text>
                    <Ionicons name="arrow-forward" size={14} color="#8b5cf6" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                </View>
                <View style={styles.referralIcon}><Ionicons name="gift" size={48} color="rgba(255,255,255,0.18)" /></View>
              </View>
            </LinearGradient>
          </View>

          <View style={{ height: 120 }} />
        </Animated.ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Balance Card
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    padding: 22,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    // keep children visible; pattern overlay is inside absolutely positioned container
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  patternCircle: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  balanceContent: { zIndex: 2 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  balanceLabel: { color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '500' },
  balanceMenuBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  balanceValue: { color: '#fff', fontSize: 34, fontWeight: 'bold', marginBottom: 8 },
  balanceChange: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  balanceChangeText: { color: '#86efac', fontSize: 13, marginLeft: 6 },

  // Action Buttons
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButtonWrap: { flex: 1, marginHorizontal: 6 },
  actionButton: { borderRadius: 12, overflow: 'hidden' },
  actionButtonGradient: { paddingVertical: 10, alignItems: 'center' },
  actionIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionButtonText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  // Stats
  statsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 20 },
  statCard: { flex: 1, borderRadius: 16, elevation: 2, marginHorizontal: 6 },
  statGradient: { padding: 14, borderRadius: 16 },
  statIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  statTrend: { flexDirection: 'row', alignItems: 'center' },
  statTrendText: { fontSize: 12, color: '#16a34a', marginLeft: 6, fontWeight: '600' },

  // Services
  servicesSection: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  seeAll: { color: '#10b981', fontSize: 14, fontWeight: '600' },
  serviceCard: { width: 140, borderRadius: 16 },
  serviceGradient: { padding: 14, borderRadius: 16, alignItems: 'center' },
  serviceTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 6, textAlign: 'center' },
  serviceDesc: { fontSize: 11, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  comingSoonBadge: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  comingSoonText: { fontSize: 10, fontWeight: '600', color: '#6b7280' },

  // Transactions
  transactionsSection: { marginTop: 24, paddingHorizontal: 16 },
  filterTabs: { flexDirection: 'row', marginBottom: 16 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#f3f4f6', borderRadius: 20, marginRight: 8 },
  filterTabActive: { backgroundColor: '#10b981' },
  filterTabText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },
  transactionsList: { paddingBottom: 4 },
  transactionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1 },
  transactionLeft: { flexDirection: 'row', flex: 1 },
  transactionIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  transactionDetails: { flex: 1 },
  transactionDesc: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  transactionMeta: { flexDirection: 'row', alignItems: 'center' },
  transactionDate: { fontSize: 12, color: '#6b7280' },
  pendingBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  pendingText: { fontSize: 10, color: '#92400e', fontWeight: '600' },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },

  // Referral
  referralSection: { paddingHorizontal: 16, marginTop: 24 },
  referralCard: { borderRadius: 20, padding: 18, overflow: 'hidden' },
  referralContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  referralLeft: { flex: 1, paddingRight: 8 },
  referralBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  referralBadgeText: { color: '#fbbf24', fontSize: 10, fontWeight: 'bold' },
  referralTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  referralText: { color: 'rgba(255,255,255,0.92)', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  referralButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  referralButtonText: { color: '#8b5cf6', fontSize: 14, fontWeight: '600' },
  referralIcon: { justifyContent: 'center', marginLeft: 8 },
});

export default WalletScreen;
