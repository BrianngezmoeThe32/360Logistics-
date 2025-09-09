import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

export const QRScanner = ({ visible, onClose, onScan }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const result = await request(permission);
      setHasPermission(result === RESULTS.GRANTED);
      
      if (result !== RESULTS.GRANTED) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access to scan QR codes.',
          [
            { text: 'Cancel', onPress: onClose },
            { text: 'Settings', onPress: () => {
              // Open app settings
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const handleQRCodeRead = (e) => {
    if (isScanning) {
      setIsScanning(false);
      const scannedData = e.data;
      
      // Process QR code data
      if (scannedData.includes('LD') && scannedData.includes('QR-CODE')) {
        const loadId = scannedData.split('-')[0];
        onScan(loadId);
        Alert.alert(
          'QR Code Scanned! ✅',
          `Load ID: ${loadId}\nQR Code data captured successfully.`,
          [
            { text: 'Scan Another', onPress: () => setIsScanning(true) },
            { text: 'Close', onPress: onClose }
          ]
        );
      } else {
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not associated with a valid load.',
          [
            { text: 'Try Again', onPress: () => setIsScanning(true) },
            { text: 'Cancel', onPress: onClose }
          ]
        );
      }
    }
  };

  const renderScanner = () => {
    if (!hasPermission) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            📷 Camera permission is required to scan QR codes
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestCameraPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <QRCodeScanner
        onRead={handleQRCodeRead}
        reactivate={isScanning}
        reactivateTimeout={2000}
        showMarker={true}
        markerStyle={styles.marker}
        cameraStyle={styles.camera}
        topContent={
          <View style={styles.topContent}>
            <Text style={styles.scannerTitle}>📦 Scan Load QR Code</Text>
            <Text style={styles.scannerSubtitle}>
              Position the QR code within the frame to scan
            </Text>
          </View>
        }
        bottomContent={
          <View style={styles.bottomContent}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.torchButton}
              onPress={() => {
                // Toggle flashlight - implement based on your camera library
                Alert.alert('Flashlight', 'Flashlight toggle would work here');
              }}
            >
              <Text style={styles.torchButtonText}>💡 Flash</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {renderScanner()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    height: height,
  },
  marker: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
    borderRadius: 10,
  },
  topContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  scannerSubtitle: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  torchButton: {
    backgroundColor: '#F39C12',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  torchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});