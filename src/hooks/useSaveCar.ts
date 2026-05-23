import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const SAVE_CAR = gql`
  mutation SaveCar($carId: String!) {
    saveCar(carId: $carId) {
      id
    }
  }
`;

const UNSAVE_CAR = gql`
  mutation UnsaveCar($carId: String!) {
    unsaveCar(carId: $carId)
  }
`;

const GET_SAVED_CAR_IDS = gql`
  query GetSavedCarIds {
    getUserSavedCars {
      id
      car { id }
    }
  }
`;

export function useSavedCarIds() {
  const { isAuthenticated } = useAuth();
  const { data, refetch } = useQuery(GET_SAVED_CAR_IDS, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const savedIds: string[] = ((data as any)?.getUserSavedCars || []).map((s: any) => s.car?.id).filter(Boolean);
  return { savedIds, refetchSaved: refetch };
}

export function useToggleSave() {
  const [saveMutation, { loading: saveLoading }] = useMutation(SAVE_CAR);
  const [unsaveMutation, { loading: unsaveLoading }] = useMutation(UNSAVE_CAR);
  const { savedIds } = useSavedCarIds();
  const { t } = useLanguage();

  const toggleSave = async (carId: string) => {
    try {
      const isSaved = savedIds.includes(carId);
      if (isSaved) {
        await unsaveMutation({
          variables: { carId },
          refetchQueries: ['GetSavedCarIds', 'GetSavedCars'],
        });
      } else {
        await saveMutation({
          variables: { carId },
          refetchQueries: ['GetSavedCarIds', 'GetSavedCars'],
        });
      }
    } catch {
      Alert.alert(t.common.error, t.saved.saveFailed);
    }
  };

  return { toggleSave, loading: saveLoading || unsaveLoading };
}
