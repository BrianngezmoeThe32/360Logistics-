import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  TextInput,
  Modal,
  Switch,
  Dimensions,
  Platform,
  Linking,
  ActivityIndicator,
  FlatList,
} from 'react-native';

// Import your QR Scanner and GPS Tracker components
// import { QRScanner } from './components/QRScanner';
// import { GPSTracker } from './components/GPSTracker';

// For now, we'll create simplified versions inline for immediate testing
const QRScannerSimulated = ({ visible, onClose, onScan }) => (
  <Modal visible={visible} animationType="slide">
    <View style={styles.qrModalContainer}>
      <View style={styles.qrScannerArea}>
        <Text style={styles.qrTitle}>📱 QR Code Scanner</Text>
        <View style={styles.qrFrame}>
          <Text style={styles.qrFrameText}>📦</Text>
          <Text style={styles.qrInstructions}>Position QR code here</Text>
        </View>
        
        <View style={styles.qrTestButtons}>
          <TouchableOpacity 
            style={styles.qrTestButton}
            onPress={() => onScan('LD001')}
          >
            <Text style={styles.qrTestButtonText}>Simulate LD001</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.qrTestButton}
            onPress={() => onScan('LD002')}
          >
            <Text style={styles.qrTestButtonText}>Simulate LD002</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.qrCloseButton} onPress={onClose}>
          <Text style={styles.qrCloseText}>❌ Close Scanner</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const GPSTrackerSimulated = ({ onLocationUpdate, isTracking, onTrackingChange }) => {
  const [simLocation, setSimLocation] = useState({
    lat: -26.2041,
    lng: 28.0473,
    accuracy: 15,
    speed: 0,
    address: "Johannesburg, GP"
  });

  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        const newLocation = {
          lat: simLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: simLocation.lng + (Math.random() - 0.5) * 0.001,
          accuracy: 10 + Math.random() * 10,
          speed: Math.random() * 80,
          address: "Moving on N1 Highway",
          timestamp: new Date().toISOString()
        };
        setSimLocation(newLocation);
        onLocationUpdate(newLocation);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isTracking, simLocation.lat, simLocation.lng]);

  return (
    <View style={styles.gpsContainer}>
      <View style={styles.gpsHeader}>
        <Text style={styles.gpsTitle}>🛰️ GPS Tracker</Text>
        <TouchableOpacity 
          style={[styles.gpsToggle, isTracking && styles.gpsToggleActive]}
          onPress={() => onTrackingChange(!isTracking)}
        >
          <Text style={styles.gpsToggleText}>
            {isTracking ? '🔴 Stop' : '🟢 Start'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.gpsStats}>
        <View style={styles.gpsStat}>
          <Text style={styles.gpsStatLabel}>Coordinates:</Text>
          <Text style={styles.gpsStatValue}>
            {simLocation.lat.toFixed(4)}, {simLocation.lng.toFixed(4)}
          </Text>
        </View>
        <View style={styles.gpsStat}>
          <Text style={styles.gpsStatLabel}>Accuracy:</Text>
          <Text style={styles.gpsStatValue}>±{simLocation.accuracy.toFixed(0)}m</Text>
        </View>
        <View style={styles.gpsStat}>
          <Text style={styles.gpsStatLabel}>Speed:</Text>
          <Text style={styles.gpsStatValue}>{simLocation.speed.toFixed(1)} km/h</Text>
        </View>
        <View style={styles.gpsStat}>
          <Text style={styles.gpsStatLabel}>Status:</Text>
          <Text style={[styles.gpsStatValue, { color: isTracking ? '#27AE60' : '#E74C3C' }]}>
            {isTracking ? 'Tracking' : 'Stopped'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const App = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('loads');
  
  // User State
  const [isOnline, setIsOnline] = useState(true);
  const [userType, setUserType] = useState('operator');
  
  // Location & GPS State
  const [currentLocation, setCurrentLocation] = useState({ 
    lat: -26.2041, 
    lng: 28.0473,
    address: "Johannesburg, GP" 
  });
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  
  // QR Scanner State
  const [qrScannerVisible, setQrScannerVisible] = useState(false);
  
  // Fuel & Cost State
  const [fuelPrice, setFuelPrice] = useState(23.45);
  const [fuelPriceLastUpdated, setFuelPriceLastUpdated] = useState(new Date());
  
  // Modal & UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [loadingState, setLoadingState] = useState({});
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Form State for Post Load
  const [loadForm, setLoadForm] = useState({
    pickupLocation: '',
    deliveryLocation: '',
    weight: '',
    rate: '',
    cargoType: 'General Cargo',
    pickupDate: new Date(),
    isUrgent: false,
    requiresSpecialHandling: false,
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Sample data for demonstration
  const [loads, setLoads] = useState([
    {
      id: 'LD001',
      origin: 'Johannesburg, GP',
      destination: 'Durban, KZN',
      weight: '25 tons',
      type: 'General Cargo',
      rate: 'R15,500',
      distance: '568 km',
      urgency: 'High',
      status: 'Available',
      shipper: 'ABC Manufacturing',
      shipperContact: '+27 11 123 4567',
      pickup: '2025-09-09',
      delivery: '2025-09-10',
      coordinates: { pickup: [-26.2041, 28.0473], delivery: [-29.8587, 31.0218] },
      qrCode: 'LD001-QR-CODE',
      progress: 0
    },
    {
      id: 'LD002',
      origin: 'Cape Town, WC',
      destination: 'Port Elizabeth, EC',
      weight: '18 tons',
      type: 'Food Products',
      rate: 'R8,200',
      distance: '745 km',
      urgency: 'Medium',
      status: 'In Transit',
      shipper: 'FreshPro Foods',
      shipperContact: '+27 21 456 7890',
      pickup: '2025-09-08',
      delivery: '2025-09-09',
      coordinates: { pickup: [-33.9249, 18.4241], delivery: [-33.9608, 25.6022] },
      qrCode: 'LD002-QR-CODE',
      progress: 65
    },
    {
      id: 'LD003',
      origin: 'Bloemfontein, FS',
      destination: 'Polokwane, LP',
      weight: '30 tons',
      type: 'Construction Materials',
      rate: 'R12,800',
      distance: '456 km',
      urgency: 'Low',
      status: 'Available',
      shipper: 'BuildCorp Ltd',
      shipperContact: '+27 51 789 0123',
      pickup: '2025-09-11',
      delivery: '2025-09-12',
      coordinates: { pickup: [-29.1217, 26.2041], delivery: [-23.9045, 29.4689] },
      qrCode: 'LD003-QR-CODE',
      progress: 0
    }
  ]);

  // Vehicle tracking data
  const [vehicles, setVehicles] = useState([
    {
      id: 'VH001',
      driverName: 'John Mthembu',
      vehicleNumber: 'GP 123 ABC',
      currentLoad: 'LD002',
      location: [-33.5, 20.1],
      speed: 85,
      fuelLevel: 75,
      status: 'In Transit'
    }
  ]);

  // Notification simulation
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.8 && notifications.length < 10) {
        const notificationTypes = [
          { title: 'New Load Available', message: 'High-priority load from Johannesburg to Durban - R15,500', type: 'load' },
          { title: 'GPS Alert', message: 'Vehicle VH001 has deviated from route', type: 'alert' },
          { title: 'Delivery Confirmation', message: 'Load LD002 successfully delivered', type: 'delivery' },
          { title: 'Fuel Price Update', message: 'Current fuel price: R23.67/L (+R0.22)', type: 'fuel' },
          { title: 'QR Code Scanned', message: 'Load LD001 QR code verified at pickup location', type: 'scan' }
        ];
        
        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const newNotification = {
          id: Date.now(),
          ...randomNotification,
          time: new Date().toLocaleTimeString(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Simulate push notification
        if (Platform.OS === 'web') {
          console.log('🔔 Push Notification:', newNotification.title);
        }
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [notifications.length]);

  // Auto-sync with web platform (simulated)
  useEffect(() => {
    const syncTimer = setInterval(() => {
      if (isOnline && !offlineMode) {
        console.log('🔄 Syncing data with web platform...');
        setFuelPriceLastUpdated(new Date());
      }
    }, 30000);

    return () => clearInterval(syncTimer);
  }, [isOnline, offlineMode]);

  // Utility Functions
  const calculateFuelCost = (distance, fuelConsumption = 3.5) => {
    if (!distance || !fuelPrice) return 0;
    const numericDistance = parseFloat(distance.replace(/[^\d.]/g, ''));
    const litersNeeded = (numericDistance * fuelConsumption) / 100;
    return (litersNeeded * fuelPrice).toFixed(2);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': '#27AE60',
      'In Transit': '#F39C12', 
      'Delivered': '#3498DB',
      'Delayed': '#E74C3C',
      'Cancelled': '#95A5A6'
    };
    return colors[status] || '#95A5A6';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      'High': '#E74C3C',
      'Medium': '#F39C12',
      'Low': '#27AE60'
    };
    return colors[urgency] || '#95A5A6';
  };

  const formatCurrency = (amount) => {
    if (typeof amount === 'string') {
      return amount.startsWith('R') ? amount : `R${amount}`;
    }
    return `R${amount?.toLocaleString() || '0'}`;
  };

  // Validation Functions
  const validateLoadForm = () => {
    const errors = {};
    
    if (!loadForm.pickupLocation.trim()) {
      errors.pickupLocation = 'Pickup location is required';
    }
    
    if (!loadForm.deliveryLocation.trim()) {
      errors.deliveryLocation = 'Delivery location is required';
    }
    
    if (!loadForm.weight || parseFloat(loadForm.weight) <= 0) {
      errors.weight = 'Weight must be greater than 0';
    }
    
    if (!loadForm.rate || parseFloat(loadForm.rate.replace(/[^\d.]/g, '')) <= 0) {
      errors.rate = 'Rate must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced Action Handlers
  const handleAcceptLoad = async (load) => {
    setLoadingState(prev => ({ ...prev, [load.id]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoads(prev => prev.map(l => 
        l.id === load.id 
          ? { ...l, status: 'Accepted', acceptedBy: userType }
          : l
      ));
      
      // Add notification for accepted load
      const acceptNotification = {
        id: Date.now(),
        title: 'Load Accepted! ✅',
        message: `Load ${load.id} accepted. GPS tracking will begin at pickup.`,
        time: new Date().toLocaleTimeString(),
        type: 'success',
        read: false
      };
      setNotifications(prev => [acceptNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      Alert.alert(
        'Load Accepted! ✅',
        `Load ${load.id} has been accepted. GPS tracking will automatically start at pickup location.`,
        [{ text: 'OK', onPress: () => setModalVisible(false) }]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to accept load. Please try again.');
    } finally {
      setLoadingState(prev => ({ ...prev, [load.id]: false }));
    }
  };

  const handleCallShipper = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('📱 Call Shipper', `Would dial: ${phoneNumber}\n\n(Phone functionality not available in web preview)`);
        }
      })
      .catch(err => console.error('Error opening phone app:', err));
  };

  // Enhanced QR Scanner Handler
  const handleQRScan = () => {
    setQrScannerVisible(true);
  };

  const handleQRCodeScanned = (loadId) => {
    setQrScannerVisible(false);
    
    const scannedLoad = loads.find(load => load.id === loadId);
    if (scannedLoad) {
      // Add scan notification
      const scanNotification = {
        id: Date.now(),
        title: 'QR Code Scanned! 📱',
        message: `Load ${loadId} verified. Status: ${scannedLoad.status}`,
        time: new Date().toLocaleTimeString(),
        type: 'scan',
        read: false
      };
      setNotifications(prev => [scanNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      setSelectedLoad(scannedLoad);
      setModalVisible(true);
      
      Alert.alert(
        'QR Code Verified! ✅',
        `Load ${loadId} details loaded.\n\nShipper: ${scannedLoad.shipper}\nRoute: ${scannedLoad.origin} → ${scannedLoad.destination}\nRate: ${scannedLoad.rate}`,
        [{ text: 'View Details', onPress: () => setModalVisible(true) }]
      );
    } else {
      Alert.alert(
        '❌ Load Not Found',
        `Load ${loadId} not found in system. Please verify the QR code or contact dispatch.`,
        [{ text: 'Try Again', onPress: () => setQrScannerVisible(true) }]
      );
    }
  };

  // Enhanced GPS Handler
  const handleLocationUpdate = (locationData) => {
    setCurrentLocation(locationData);
    
    // Simulate geofencing alerts
    if (Math.random() > 0.95) {
      const geoAlerts = [
        'Approaching delivery zone',
        'Entered pickup location',
        'Route deviation detected',
        'Speed limit exceeded'
      ];
      
      const alert = geoAlerts[Math.floor(Math.random() * geoAlerts.length)];
      const geoNotification = {
        id: Date.now(),
        title: '🛰️ GPS Alert',
        message: alert,
        time: new Date().toLocaleTimeString(),
        type: 'gps',
        read: false
      };
      setNotifications(prev => [geoNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleProofOfDelivery = () => {
    Alert.alert(
      '📸 Proof of Delivery',
      'Choose proof of delivery method:',
      [
        { text: 'Take Photo', onPress: () => {
          Alert.alert('📷 Camera', 'Camera would open to capture delivery photos');
          // Add POD notification
          const podNotification = {
            id: Date.now(),
            title: '📸 Photo Captured',
            message: 'Delivery photo saved to load documentation',
            time: new Date().toLocaleTimeString(),
            type: 'pod',
            read: false
          };
          setNotifications(prev => [podNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }},
        { text: 'Digital Signature', onPress: () => {
          Alert.alert('✍️ Signature', 'Signature pad would open for customer signature');
        }},
        { text: 'Scan QR', onPress: () => setQrScannerVisible(true) },
        { text: 'Cancel' }
      ]
    );
  };

  const handleIncidentReport = () => {
    Alert.alert(
      '📝 Incident Report',
      'What type of incident would you like to report?',
      [
        { text: 'Traffic Accident', onPress: () => Alert.alert('🚗 Accident', 'Accident report form would open with GPS location pre-filled') },
        { text: 'Vehicle Breakdown', onPress: () => Alert.alert('🔧 Breakdown', 'Breakdown report form with roadside assistance options') },
        { text: 'Load Damage', onPress: () => Alert.alert('📦 Damage', 'Load damage report with photo capture') },
        { text: 'Route Delay', onPress: () => Alert.alert('⏰ Delay', 'Delay report with estimated arrival update') },
        { text: 'Other', onPress: () => Alert.alert('📋 Report', 'General incident form opened') },
        { text: 'Cancel' }
      ]
    );
  };

  const handleOfflineToggle = () => {
    setOfflineMode(!offlineMode);
    Alert.alert(
      offlineMode ? '🟢 Back Online' : '🔴 Offline Mode',
      offlineMode 
        ? 'Reconnected! Data synced with web platform. All cached data uploaded successfully.' 
        : 'Working offline. Data will be cached locally and synced when connection is restored.'
    );
  };

  const handlePostLoad = async () => {
    if (!validateLoadForm()) {
      Alert.alert('❌ Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setLoadingState(prev => ({ ...prev, posting: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newLoad = {
        id: `LD${String(loads.length + 1).padStart(3, '0')}`,
        origin: loadForm.pickupLocation,
        destination: loadForm.deliveryLocation,
        weight: `${loadForm.weight} tons`,
        type: loadForm.cargoType,
        rate: formatCurrency(loadForm.rate),
        distance: '--- km',
        urgency: loadForm.isUrgent ? 'High' : 'Medium',
        status: 'Available',
        shipper: 'Your Company',
        shipperContact: '+27 11 000 0000',
        pickup: loadForm.pickupDate.toISOString().split('T')[0],
        delivery: new Date(loadForm.pickupDate.getTime() + 24*60*60*1000).toISOString().split('T')[0],
        coordinates: { pickup: currentLocation, delivery: null },
        qrCode: `${`LD${String(loads.length + 1).padStart(3, '0')}`}-QR-CODE`,
        progress: 0
      };

      setLoads(prev => [newLoad, ...prev]);

      // Reset form
      setLoadForm({
        pickupLocation: '',
        deliveryLocation: '',
        weight: '',
        rate: '',
        cargoType: 'General Cargo',
        pickupDate: new Date(),
        isUrgent: false,
        requiresSpecialHandling: false,
        description: ''
      });

      // Add success notification
      const postNotification = {
        id: Date.now(),
        title: 'Load Posted Successfully! 📦',
        message: `Load ${newLoad.id} is now visible to transport operators`,
        time: new Date().toLocaleTimeString(),
        type: 'success',
        read: false
      };
      setNotifications(prev => [postNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      Alert.alert(
        'Load Posted! 📦',
        `Load ${newLoad.id} posted successfully!\n\nQR Code: ${newLoad.qrCode}\nRate: ${newLoad.rate}\n\nOperators can now view and accept this load.`,
        [{ text: 'View Load', onPress: () => {
          setActiveTab('loads');
          setSelectedLoad(newLoad);
          setModalVisible(true);
        }}]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to post load. Please try again.');
    } finally {
      setLoadingState(prev => ({ ...prev, posting: false }));
    }
  };

  // Memoized filtered loads for performance
  const filteredLoads = useMemo(() => {
    return loads.filter(load => {
      const matchesSearch = !searchQuery || 
        load.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = activeFilter === 'all' ||
        (activeFilter === 'urgent' && load.urgency === 'High') ||
        (activeFilter === 'today' && load.pickup === new Date().toISOString().split('T')[0]) ||
        (activeFilter === 'available' && load.status === 'Available') ||
        (activeFilter === 'in-transit' && load.status === 'In Transit');

      return matchesSearch && matchesFilter;
    });
  }, [loads, searchQuery, activeFilter]);

  // Component Render Functions
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>360</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>360 Logistics Mobile</Text>
          <Text style={styles.headerSubtitle}>
            {isOnline && !offlineMode ? '🟢 Online' : '🔴 Offline'} | {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationIcon}
          onPress={() => {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            Alert.alert(
              '🔔 Notifications', 
              notifications.length > 0 
                ? `${notifications.length} notifications\n\n${notifications.slice(0, 5).map(n => `${n.title}: ${n.message}`).join('\n\n')}`
                : 'No notifications'
            );
          }}
        >
          {unreadCount > 0 && (
            <Text style={styles.notificationBadge}>{unreadCount}</Text>
          )}
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoadCard = ({ item: load }) => (
    <TouchableOpacity 
      style={styles.loadCard}
      onPress={() => {
        setSelectedLoad(load);
        setModalVisible(true);
      }}
    >
      <View style={styles.loadHeader}>
        <Text style={styles.loadId}>{load.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, {color: getStatusColor(load.status)}]}>
            {load.status}
          </Text>
        </View>
        <View style={[styles.urgencyBadge, {backgroundColor: getUrgencyColor(load.urgency)}]}>
          <Text style={styles.urgencyText}>{load.urgency}</Text>
        </View>
      </View>
      
      <View style={styles.routeContainer}>
        <Text style={styles.routeText}>📍 {load.origin}</Text>
        <Text style={styles.arrow}>➡️</Text>
        <Text style={styles.routeText}>🎯 {load.destination}</Text>
      </View>

      <View style={styles.loadDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Weight:</Text>
          <Text style={styles.detailValue}>{load.weight}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>{load.type}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rate:</Text>
          <Text style={[styles.detailValue, styles.rateText]}>{load.rate}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>QR Code:</Text>
          <Text style={styles.detailValue}>{load.qrCode}</Text>
        </View>
        {load.distance !== '--- km' && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Est. Fuel:</Text>
            <Text style={styles.detailValue}>R{calculateFuelCost(load.distance)}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCallShipper(load.shipperContact)}
        >
          <Text style={styles.actionText}>📱 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleQRScan}
        >
          <Text style={styles.actionText}>📱 Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => handleAcceptLoad(load)}
          disabled={loadingState[load.id]}
        >
          {loadingState[load.id] ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.actionText, styles.primaryActionText]}>✅ Accept</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderLoadSearch = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search loads by ID, route, cargo type..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.icon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilters}>
        {[
          { id: 'all', label: 'All Loads' },
          { id: 'urgent', label: 'High Priority' },
          { id: 'available', label: 'Available' },
          { id: 'today', label: 'Today' },
          { id: 'in-transit', label: 'In Transit' }
        ].map(filter => (
          <TouchableOpacity 
            key={filter.id}
            style={[styles.filterChip, activeFilter === filter.id && styles.activeFilter]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text style={[styles.filterText, activeFilter === filter.id && styles.activeFilterText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredLoads}
        renderItem={renderLoadCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={() => {
          Alert.alert('🔄 Refreshed', 'Load data updated from server');
        }}
      />
    </View>
  );

  const renderTracking = () => (
    <ScrollView style={styles.tabContent}>
      {/* Enhanced GPS Tracker Component */}
      <GPSTrackerSimulated 
        onLocationUpdate={handleLocationUpdate}
        isTracking={isTrackingLocation}
        onTrackingChange={setIsTrackingLocation}
      />

      <View style={styles.trackingCard}>
        <Text style={styles.trackingTitle}>🚛 Active Loads</Text>
        {loads.filter(load => load.status === 'In Transit').map((load) => (
          <View key={load.id} style={styles.activeLoad}>
            <View style={styles.loadSummary}>
              <Text style={styles.loadId}>{load.id}</Text>
              <Text style={styles.routeText}>{load.origin} → {load.destination}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progress, {width: `${load.progress}%`}]} />
              </View>
              <Text style={styles.progressText}>{load.progress}% Complete</Text>
            </View>
            <View style={styles.trackingActions}>
              <TouchableOpacity 
                style={styles.trackingButton}
                onPress={() => handleCallShipper(load.shipperContact)}
              >
                <Text style={styles.icon}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.trackingButton}
                onPress={handleQRScan}
              >
                <Text style={styles.icon}>📱</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.trackingButton}
                onPress={handleIncidentReport}
              >
                <Text style={styles.icon}>⚠️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {loads.filter(load => load.status === 'In Transit').length === 0 && (
          <Text style={styles.noDataText}>No active loads currently being tracked</Text>
        )}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={handleQRScan}>
          <Text style={styles.quickActionIcon}>📱</Text>
          <Text style={styles.quickActionText}>Scan QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={handleProofOfDelivery}>
          <Text style={styles.quickActionIcon}>📸</Text>
          <Text style={styles.quickActionText}>Proof of Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={handleIncidentReport}>
          <Text style={styles.quickActionIcon}>📝</Text>
          <Text style={styles.quickActionText}>Incident Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => {
          Alert.alert(
            '⛽ Fuel Calculator', 
            `Current Fuel Price: R${fuelPrice}/L\nLast Updated: ${fuelPriceLastUpdated.toLocaleTimeString()}\n\nEnter distance to calculate fuel costs for your route.`,
            [
              { text: 'Calculate Route', onPress: () => {
                Alert.prompt('Distance Calculator', 'Enter distance in km:', (distance) => {
                  if (distance && !isNaN(distance)) {
                    const cost = calculateFuelCost(`${distance} km`);
                    Alert.alert('💰 Fuel Cost', `Distance: ${distance}km\nFuel Cost: R${cost}\nAt R${fuelPrice}/L`);
                  }
                });
              }},
              { text: 'Cancel' }
            ]
          );
        }}>
          <Text style={styles.quickActionIcon}>⛽</Text>
          <Text style={styles.quickActionText}>Fuel Calculator</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPostLoad = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>📦 Post New Load</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Pickup Location *</Text>
          <TextInput 
            style={[styles.input, formErrors.pickupLocation && styles.inputError]} 
            placeholder="Enter pickup address..."
            value={loadForm.pickupLocation}
            onChangeText={(text) => setLoadForm(prev => ({ ...prev, pickupLocation: text }))}
          />
          {formErrors.pickupLocation && (
            <Text style={styles.errorText}>{formErrors.pickupLocation}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Delivery Location *</Text>
          <TextInput 
            style={[styles.input, formErrors.deliveryLocation && styles.inputError]} 
            placeholder="Enter delivery address..."
            value={loadForm.deliveryLocation}
            onChangeText={(text) => setLoadForm(prev => ({ ...prev, deliveryLocation: text }))}
          />
          {formErrors.deliveryLocation && (
            <Text style={styles.errorText}>{formErrors.deliveryLocation}</Text>
          )}
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Weight (tons) *</Text>
            <TextInput 
              style={[styles.input, formErrors.weight && styles.inputError]} 
              placeholder="25" 
              keyboardType="numeric"
              value={loadForm.weight}
              onChangeText={(text) => setLoadForm(prev => ({ ...prev, weight: text }))}
            />
            {formErrors.weight && (
              <Text style={styles.errorText}>{formErrors.weight}</Text>
            )}
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Rate (ZAR) *</Text>
            <TextInput 
              style={[styles.input, formErrors.rate && styles.inputError]} 
              placeholder="15,000" 
              keyboardType="numeric"
              value={loadForm.rate}
              onChangeText={(text) => setLoadForm(prev => ({ ...prev, rate: text }))}
            />
            {formErrors.rate && (
              <Text style={styles.errorText}>{formErrors.rate}</Text>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cargo Type</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>{loadForm.cargoType}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Additional details about the cargo..."
            multiline
            numberOfLines={3}
            value={loadForm.description}
            onChangeText={(text) => setLoadForm(prev => ({ ...prev, description: text }))}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>🚨 Urgent Load</Text>
          <Switch 
            value={loadForm.isUrgent}
            onValueChange={(value) => setLoadForm(prev => ({ ...prev, isUrgent: value }))}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>⚠️ Special Handling Required</Text>
          <Switch 
            value={loadForm.requiresSpecialHandling}
            onValueChange={(value) => setLoadForm(prev => ({ ...prev, requiresSpecialHandling: value }))}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loadingState.posting && styles.submitButtonDisabled]} 
          onPress={handlePostLoad}
          disabled={loadingState.posting}
        >
          {loadingState.posting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>📤 Post Load</Text>
          )}
        </TouchableOpacity>

        <View style={styles.estimateCard}>
          <Text style={styles.estimateTitle}>💰 Cost Estimate</Text>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Distance:</Text>
            <Text style={styles.estimateValue}>~568 km (calculated after posting)</Text>
          </View>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Est. Fuel Cost:</Text>
            <Text style={styles.estimateValue}>R{calculateFuelCost('568 km')}</Text>
          </View>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Current Fuel Price:</Text>
            <Text style={styles.estimateValue}>R{fuelPrice}/L</Text>
          </View>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Estimated Time:</Text>
            <Text style={styles.estimateValue}>~8 hours</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{loads.length}</Text>
          <Text style={styles.statLabel}>Total Loads</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>R{(loads.reduce((sum, load) => sum + parseFloat(load.rate.replace(/[^\d.]/g, '') || 0), 0)).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {Math.round((loads.filter(l => l.status === 'Delivered').length / loads.length) * 100) || 98}%
          </Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{vehicles.length}</Text>
          <Text style={styles.statLabel}>Active Vehicles</Text>
        </View>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>📋 Recent Activity</Text>
        {notifications.length > 0 ? notifications.slice(0, 5).map((notification) => (
          <View key={notification.id} style={styles.activityItem}>
            <Text style={styles.activityIcon}>
              {notification.type === 'load' ? '📦' : 
               notification.type === 'alert' ? '⚠️' : 
               notification.type === 'delivery' ? '✅' : 
               notification.type === 'fuel' ? '⛽' :
               notification.type === 'scan' ? '📱' :
               notification.type === 'gps' ? '🛰️' :
               notification.type === 'success' ? '✅' :
               notification.type === 'pod' ? '📸' : '📦'}
            </Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{notification.title}</Text>
              <Text style={styles.activityMessage}>{notification.message}</Text>
              <Text style={styles.activityTime}>{notification.time}</Text>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>
        )) : (
          <Text style={styles.noDataText}>No recent activity</Text>
        )}
      </View>

      <View style={styles.fuelPriceCard}>
        <Text style={styles.fuelTitle}>⛽ Current Fuel Price</Text>
        <Text style={styles.fuelPrice}>R{fuelPrice}/L</Text>
        <Text style={styles.fuelUpdate}>
          Updated {Math.floor((new Date() - fuelPriceLastUpdated) / (1000 * 60))} minutes ago
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            setFuelPrice(prev => +(prev + (Math.random() - 0.5) * 0.5).toFixed(2));
            setFuelPriceLastUpdated(new Date());
            Alert.alert('🔄 Updated', 'Fuel price refreshed from Automobile Association of SA');
          }}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Price</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.systemStatus}>
        <Text style={styles.sectionTitle}>⚙️ System Status</Text>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Connection:</Text>
          <Text style={[styles.statusValue, { color: isOnline && !offlineMode ? '#27AE60' : '#E74C3C' }]}>
            {isOnline && !offlineMode ? 'Online' : 'Offline'}
          </Text>
          <TouchableOpacity onPress={handleOfflineToggle} style={styles.toggleButton}>
            <Text style={styles.toggleText}>Toggle</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>GPS Tracking:</Text>
          <Text style={[styles.statusValue, { color: isTrackingLocation ? '#27AE60' : '#95A5A6' }]}>
            {isTrackingLocation ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>QR Scanner:</Text>
          <Text style={styles.statusValue}>Ready</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Sync Status:</Text>
          <Text style={styles.statusValue}>
            {offlineMode ? 'Pending sync' : 'Up to date'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderLoadModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedLoad && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Load Details - {selectedLoad.id}</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>📍 Route Information</Text>
                  <Text style={styles.modalText}>From: {selectedLoad.origin}</Text>
                  <Text style={styles.modalText}>To: {selectedLoad.destination}</Text>
                  <Text style={styles.modalText}>Distance: {selectedLoad.distance}</Text>
                  {selectedLoad.distance !== '--- km' && (
                    <Text style={styles.modalText}>Est. Fuel Cost: R{calculateFuelCost(selectedLoad.distance)}</Text>
                  )}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>📦 Cargo Details</Text>
                  <Text style={styles.modalText}>Weight: {selectedLoad.weight}</Text>
                  <Text style={styles.modalText}>Type: {selectedLoad.type}</Text>
                  <Text style={styles.modalText}>Rate: {selectedLoad.rate}</Text>
                  <Text style={styles.modalText}>Status: {selectedLoad.status}</Text>
                  <Text style={styles.modalText}>QR Code: {selectedLoad.qrCode}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>📅 Schedule</Text>
                  <Text style={styles.modalText}>Pickup: {selectedLoad.pickup}</Text>
                  <Text style={styles.modalText}>Delivery: {selectedLoad.delivery}</Text>
                  <Text style={styles.modalText}>Urgency: {selectedLoad.urgency}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>🏢 Shipper Information</Text>
                  <Text style={styles.modalText}>Company: {selectedLoad.shipper}</Text>
                  <Text style={styles.modalText}>Contact: {selectedLoad.shipperContact}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>📱 Quick Actions</Text>
                  <View style={styles.modalQuickActions}>
                    <TouchableOpacity 
                      style={styles.modalQuickAction}
                      onPress={handleQRScan}
                    >
                      <Text style={styles.modalQuickActionText}>📱 Scan QR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.modalQuickAction}
                      onPress={() => Alert.alert('🗺️ GPS Navigation', 'Would open navigation app with pickup/delivery locations')}
                    >
                      <Text style={styles.modalQuickActionText}>🗺️ Navigate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.modalQuickAction}
                      onPress={handleProofOfDelivery}
                    >
                      <Text style={styles.modalQuickActionText}>📸 POD</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {selectedLoad.status === 'In Transit' && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📊 Progress Tracking</Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progress, {width: `${selectedLoad.progress}%`}]} />
                      </View>
                      <Text style={styles.progressText}>{selectedLoad.progress}% Complete</Text>
                    </View>
                    <Text style={styles.modalText}>🛰️ GPS tracking active</Text>
                    <Text style={styles.modalText}>📱 Last scan: {new Date().toLocaleTimeString()}</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => handleCallShipper(selectedLoad.shipperContact)}
                >
                  <Text style={styles.modalButtonText}>📱 Call Shipper</Text>
                </TouchableOpacity>
                {selectedLoad.status === 'Available' && (
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.primaryModalButton]}
                    onPress={() => handleAcceptLoad(selectedLoad)}
                    disabled={loadingState[selectedLoad.id]}
                  >
                    {loadingState[selectedLoad.id] ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.modalButtonText, styles.primaryModalButtonText]}>
                        ✅ Accept Load
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const tabs = [
    { id: 'loads', title: 'Loads', icon: '📦', content: renderLoadSearch },
    { id: 'tracking', title: 'Tracking', icon: '🗺️', content: renderTracking },
    { id: 'post', title: 'Post Load', icon: '📤', content: renderPostLoad },
    { id: 'dashboard', title: 'Dashboard', icon: '📊', content: renderDashboard },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {renderHeader()}

      <View style={styles.content}>
        {tabs.find(tab => tab.id === activeTab)?.content()}
      </View>

      <View style={styles.bottomNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.navItem,
              activeTab === tab.id && styles.activeNavItem
            ]}
            onPress={() => setActiveTab(tab.id)}
            accessibilityLabel={`${tab.title} tab`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
          >
            <Text style={[
              styles.navIcon, 
              activeTab === tab.id && styles.activeNavIcon
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.navText,
              activeTab === tab.id && styles.activeNavText
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* QR Scanner Component */}
      <QRScannerSimulated 
        visible={qrScannerVisible}
        onClose={() => setQrScannerVisible(false)}
        onScan={handleQRCodeScanned}
      />

      {renderLoadModal()}
    </SafeAreaView>
  );
};

// Enhanced StyleSheet with new components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#1B4D3E', // Dark teal from logo
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#FF7F50', // Orange/coral from logo
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#B8D4CA', // Light teal
    marginTop: 2,
  },
  notificationIcon: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF7F50', // Orange accent
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // QR Scanner Styles
  qrModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrScannerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  qrTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  qrFrame: {
    width: 200,
    height: 200,
    borderColor: '#2E7D5A', // Medium teal
    borderWidth: 3,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(46, 125, 90, 0.1)',
  },
  qrFrameText: {
    fontSize: 48,
    marginBottom: 10,
  },
  qrInstructions: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  qrTestButtons: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  qrTestButton: {
    backgroundColor: '#2E7D5A', // Medium teal
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  qrTestButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  qrCloseButton: {
    backgroundColor: '#FF7F50', // Orange accent
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  qrCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // GPS Tracker Styles
  gpsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D5A', // Medium teal accent
  },
  gpsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gpsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E', // Dark teal
  },
  gpsToggle: {
    backgroundColor: '#95A5A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  gpsToggleActive: {
    backgroundColor: '#FF7F50', // Orange accent
  },
  gpsToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gpsStats: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  gpsStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gpsStatLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  gpsStatValue: {
    fontSize: 14,
    color: '#1B4D3E', // Dark teal
    fontWeight: '600',
  },

  // Search and Filter Styles
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButton: {
    backgroundColor: '#2E7D5A', // Medium teal
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickFilters: {
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilter: {
    backgroundColor: '#2E7D5A', // Medium teal
    borderColor: '#2E7D5A',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Load Card Styles
  loadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7F50', // Orange accent
  },
  loadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E', // Dark teal
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeText: {
    fontSize: 14,
    color: '#1B4D3E', // Dark teal
    flex: 1,
  },
  arrow: {
    marginHorizontal: 8,
    color: '#2E7D5A', // Medium teal
  },
  loadDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1B4D3E', // Dark teal
    fontWeight: '600',
  },
  rateText: {
    color: '#2E7D5A', // Medium teal for positive values
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  primaryAction: {
    backgroundColor: '#2E7D5A', // Medium teal
  },
  primaryActionText: {
    color: '#FFFFFF',
  },

  // Tracking Styles
  trackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E', // Dark teal
    marginBottom: 12,
  },
  activeLoad: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    paddingBottom: 12,
    marginBottom: 12,
  },
  loadSummary: {
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    marginBottom: 4,
  },
  progress: {
    height: '100%',
    backgroundColor: '#2E7D5A', // Medium teal
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  trackingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trackingButton: {
    backgroundColor: '#ECF0F1',
    padding: 8,
    borderRadius: 20,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 3,
    borderTopColor: '#FF7F50', // Orange accent
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: '#2E7D5A', // Medium teal
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B4D3E', // Dark teal
    textAlign: 'center',
  },

  // Form Styles
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E', // Dark teal
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4D3E', // Dark teal
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#FF7F50', // Orange for errors
  },
  errorText: {
    fontSize: 12,
    color: '#FF7F50', // Orange for errors
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  dropdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1B4D3E', // Dark teal
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4D3E', // Dark teal
  },
  submitButton: {
    backgroundColor: '#2E7D5A', // Medium teal
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  estimateCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7F50', // Orange accent
  },
  estimateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E', // Dark teal
    marginBottom: 12,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  estimateLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  estimateValue: {
    fontSize: 14,
    color: '#1B4D3E', // Dark teal
    fontWeight: '600',
  },

  // Dashboard Styles
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 3,
    borderTopColor: '#2E7D5A', // Medium teal
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7F50', // Orange accent
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  recentActivity: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E', // Dark teal
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#2E7D5A', // Medium teal
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4D3E', // Dark teal
    marginBottom: 2,
  },
  activityMessage: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
    color: '#BDC3C7',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7F50', // Orange accent
  },
  fuelPriceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 3,
    borderTopColor: '#FF7F50', // Orange accent
  },
  fuelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E', // Dark teal
    marginBottom: 8,
  },
  fuelPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF7F50', // Orange accent
    marginBottom: 4,
  },
  fuelUpdate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: '#2E7D5A', // Medium teal
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  systemStatus: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4D3E', // Dark teal
  },
  toggleButton: {
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  noDataText: {
    textAlign: 'center',
    color: '#BDC3C7',
    fontStyle: 'italic',
    padding: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    backgroundColor: '#1B4D3E', // Dark teal header
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E', // Dark teal
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 4,
  },
  modalQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalQuickAction: {
    backgroundColor: '#2E7D5A', // Medium teal
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  modalQuickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  modalButton: {
    backgroundColor: '#ECF0F1',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  primaryModalButton: {
    backgroundColor: '#2E7D5A', // Medium teal
  },
  primaryModalButtonText: {
    color: '#FFFFFF',
  },

  // Navigation Styles
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeNavItem: {
    backgroundColor: 'rgba(46, 125, 90, 0.1)', // Light teal background
  },
  navIcon: {
    fontSize: 20,
    color: '#BDC3C7',
    marginBottom: 4,
  },
  activeNavIcon: {
    color: '#2E7D5A', // Medium teal
  },
  navText: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  activeNavText: {
    color: '#2E7D5A', // Medium teal
    fontWeight: '600',
  },
});

export default App;