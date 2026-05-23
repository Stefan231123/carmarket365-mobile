import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const requestLocation = useCallback(async (): Promise<UserLocation | null> => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t.common.locationPermission,
          t.common.locationPermissionMessage,
        );
        setLoading(false);
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const result: UserLocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      // Reverse geocode to get city name
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (geocode) {
          result.city = geocode.city || undefined;
          result.region = geocode.region || undefined;
        }
      } catch {
        // Geocoding may fail — location coordinates still valid
      }

      setLocation(result);
      return result;
    } catch {
      Alert.alert(t.common.error, t.common.locationError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [t]);

  return { location, loading, requestLocation };
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`;
  return `${Math.round(distanceKm)} km`;
}

export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
