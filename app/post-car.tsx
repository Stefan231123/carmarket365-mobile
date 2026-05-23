import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator,
  Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useMutation, useApolloClient } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';
import { formatEnum, translateEnum } from '../src/utils/formatters';
import { uploadImageToS3 } from '../src/utils/s3-upload';
import { useLanguage } from '../src/context/LanguageContext';
import { CAR_MAKES, COMMON_FEATURES, COMMON_SAFETY } from '../src/constants/car-data';
import { VehicleType, FuelType, TransmissionType, CarCondition, DrivetrainType } from '../src/constants/enums';

const CREATE_CAR = gql`
  mutation CreateCar($input: CreateCarInput!) {
    createCar(input: $input) {
      id
      make
      model
      year
      price
    }
  }
`;

const CREATE_CAR_IMAGE = gql`
  mutation CreateCarImage($input: CreateCarImageInput!) {
    createCarImage(input: $input) {
      id
      url
      isMain
      sortOrder
    }
  }
`;


interface CarFormData {
  make: string;
  model: string;
  variant: string;
  year: string;
  price: string;
  mileage: string;
  condition: string;
  vehicleType: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  engineSize: string;
  horsePower: string;
  color: string;
  interiorColor: string;
  doors: string;
  seats: string;
  description: string;
  features: string[];
  safetyFeatures: string[];
  contactPhone: string;
  contactEmail: string;
  location: string;
  city: string;
  priceNegotiable: boolean;
  acceptsTradeIn: boolean;
  allowTestDrive: boolean;
}


export default function PostCarScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const steps = [t.post.stepBasicInfo, t.post.stepDetails, t.post.stepFeatures, t.post.stepPhotosContact];
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState('');
  const [form, setForm] = useState<CarFormData>({
    make: '', model: '', variant: '', year: '', price: '', mileage: '',
    condition: 'USED', vehicleType: 'CAR', fuelType: '', transmission: '',
    drivetrain: '', engineSize: '', horsePower: '', color: '', interiorColor: '',
    doors: '', seats: '', description: '', features: [], safetyFeatures: [],
    contactPhone: '', contactEmail: '', location: '', city: '',
    priceNegotiable: false, acceptsTradeIn: false, allowTestDrive: false,
  });

  const client = useApolloClient();
  const [createCar] = useMutation(CREATE_CAR);
  const [createCarImage] = useMutation(CREATE_CAR_IMAGE);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const updateForm = (field: keyof CarFormData, value: string | boolean | string[]) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setForm((f) => ({
      ...f,
      features: f.features.includes(feature)
        ? f.features.filter((x) => x !== feature)
        : [...f.features, feature],
    }));
  };

  const toggleSafety = (feature: string) => {
    setForm((f) => ({
      ...f,
      safetyFeatures: f.safetyFeatures.includes(feature)
        ? f.safetyFeatures.filter((x) => x !== feature)
        : [...f.safetyFeatures, feature],
    }));
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.post.permissionRequired, t.post.photoLibraryPermission);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 20 - images.length,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 20));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.post.permissionRequired, t.post.cameraPermission);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 20));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.make) { Alert.alert(t.common.required, t.post.selectMakeAlert); return false; }
      if (!form.model.trim()) { Alert.alert(t.common.required, t.post.enterModelAlert); return false; }
      if (!form.year || parseInt(form.year) < 1900) { Alert.alert(t.common.required, t.post.enterYearAlert); return false; }
      if (!form.price || parseInt(form.price) <= 0) { Alert.alert(t.common.required, t.post.enterPriceAlert); return false; }
      if (!form.mileage && form.condition !== 'NEW') { Alert.alert(t.common.required, t.post.enterMileageAlert); return false; }
    }
    if (step === 1) {
      if (!form.fuelType) { Alert.alert(t.common.required, t.post.selectFuelAlert); return false; }
      if (!form.transmission) { Alert.alert(t.common.required, t.post.selectTransmissionAlert); return false; }
    }
    if (step === 3) {
      if (!form.location.trim()) { Alert.alert(t.common.required, t.post.enterLocationAlert); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const input: Record<string, unknown> = {
        make: form.make,
        model: form.model.trim(),
        year: parseInt(form.year),
        price: parseFloat(form.price),
        mileage: parseInt(form.mileage) || 0,
        condition: form.condition,
        vehicleType: form.vehicleType,
        fuelType: form.fuelType,
        transmission: form.transmission,
        location: form.location.trim(),
        features: form.features,
        safetyFeatures: form.safetyFeatures,
        priceNegotiable: form.priceNegotiable,
        acceptsTradeIn: form.acceptsTradeIn,
        allowTestDrive: form.allowTestDrive,
      };
      if (form.variant.trim()) input.variant = form.variant.trim();
      if (form.drivetrain) input.drivetrain = form.drivetrain;
      if (form.engineSize) input.engineSize = parseInt(form.engineSize);
      if (form.horsePower) input.horsePower = parseInt(form.horsePower);
      if (form.color.trim()) input.color = form.color.trim();
      if (form.interiorColor.trim()) input.interiorColor = form.interiorColor.trim();
      if (form.doors) input.doors = parseInt(form.doors);
      if (form.seats) input.seats = parseInt(form.seats);
      if (form.description.trim()) input.description = form.description.trim();
      if (form.contactPhone.trim()) input.contactPhone = form.contactPhone.trim();
      if (form.contactEmail.trim()) input.contactEmail = form.contactEmail.trim();
      if (form.city.trim()) input.city = form.city.trim();

      setUploadProgress(t.post.creatingListing);
      const { data } = await createCar({ variables: { input } });
      const carId = (data as any)?.createCar?.id;

      // Upload images to S3 via presigned URLs, then register each in the DB
      if (images.length > 0 && carId) {
        let failedCount = 0;
        for (let i = 0; i < images.length; i++) {
          setUploadProgress(`${t.post.uploadingImages} (${i + 1}/${images.length})...`);
          try {
            const uploaded = await uploadImageToS3(images[i].uri, carId, client);
            await createCarImage({
              variables: {
                input: {
                  carId,
                  s3Key: uploaded.s3Key,
                  fileName: uploaded.fileName,
                  sortOrder: i,
                  isMain: i === 0,
                },
              },
            });
          } catch {
            failedCount++;
          }
        }
        if (failedCount > 0) {
          Alert.alert(
            t.common.error,
            t.post.imageUploadFailed.replace('{count}', String(failedCount)).replace('{total}', String(images.length)),
          );
        }
      }

      setUploadProgress('');
      Alert.alert(t.post.successTitle, t.post.successMessage, [
        { text: t.post.viewListing, onPress: () => router.replace(`/car/${carId}`) },
        { text: t.common.ok, onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
    } finally {
      setSubmitting(false);
    }
  };

  const getPickerOptions = (): { label: string; value: string }[] => {
    switch (pickerField) {
      case 'make': return CAR_MAKES.map((m) => ({ label: m, value: m }));
      case 'vehicleType': return Object.values(VehicleType).map((v) => ({ label: translateEnum('vehicleTypes', v, t.enums), value: v }));
      case 'condition': return Object.values(CarCondition).map((v) => ({ label: translateEnum('conditions', v, t.enums), value: v }));
      case 'fuelType': return Object.values(FuelType).map((v) => ({ label: translateEnum('fuelTypes', v, t.enums), value: v }));
      case 'transmission': return Object.values(TransmissionType).map((v) => ({ label: translateEnum('transmissions', v, t.enums), value: v }));
      case 'drivetrain': return Object.values(DrivetrainType).map((v) => ({ label: translateEnum('drivetrains', v, t.enums), value: v }));
      default: return [];
    }
  };

  const renderPickerButton = (label: string, field: keyof CarFormData, placeholder: string) => {
    const enumMap: Record<string, 'vehicleTypes' | 'conditions' | 'fuelTypes' | 'transmissions' | 'drivetrains'> = {
      vehicleType: 'vehicleTypes', condition: 'conditions', fuelType: 'fuelTypes',
      transmission: 'transmissions', drivetrain: 'drivetrains',
    };
    const cat = enumMap[field];
    const displayVal = form[field] ? (cat ? translateEnum(cat, String(form[field]), t.enums) : String(form[field])) : placeholder;
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={styles.selectButton}
          onPress={() => { setPickerField(field); setPickerVisible(true); }}
        >
          <Text style={form[field] ? styles.selectText : styles.selectPlaceholder}>
            {displayVal}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
        </Pressable>
      </View>
    );
  };

  const renderInput = (label: string, field: keyof CarFormData, opts?: {
    placeholder?: string; keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    multiline?: boolean; required?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}{opts?.required ? ' *' : ''}</Text>
      <TextInput
        style={[styles.input, opts?.multiline && styles.inputMultiline]}
        placeholder={opts?.placeholder || ''}
        placeholderTextColor={COLORS.textMuted}
        value={String(form[field] || '')}
        onChangeText={(t) => updateForm(field, t)}
        keyboardType={opts?.keyboardType || 'default'}
        multiline={opts?.multiline}
        numberOfLines={opts?.multiline ? 4 : 1}
      />
    </View>
  );

  const renderToggle = (label: string, field: keyof CarFormData) => (
    <Pressable style={styles.toggleRow} onPress={() => updateForm(field, !form[field])}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggleSwitch, form[field] && styles.toggleSwitchActive]}>
        <View style={[styles.toggleThumb, form[field] && styles.toggleThumbActive]} />
      </View>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        {steps.map((s, i) => (
          <View key={s} style={styles.progressStep}>
            <View style={[styles.progressDot, i <= step && styles.progressDotActive]}>
              {i < step ? (
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              ) : (
                <Text style={[styles.progressDotText, i <= step && styles.progressDotTextActive]}>{i + 1}</Text>
              )}
            </View>
            {i === step && <Text style={styles.progressLabel}>{s}</Text>}
            {i < steps.length - 1 && <View style={[styles.progressLine, i < step && styles.progressLineActive]} />}
          </View>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        {/* Step 1 */}
        {step === 0 && (
          <View style={styles.stepCard}>
            {renderPickerButton(t.post.make + ' *', 'make', t.post.selectMake)}
            {renderInput(t.post.model + ' *', 'model', { placeholder: t.post.enterModel, required: true })}
            {renderInput(t.post.variant, 'variant', { placeholder: t.post.variantPlaceholder })}
            {renderInput(t.post.year + ' *', 'year', { placeholder: '2020', keyboardType: 'numeric', required: true })}
            {renderInput(t.post.price + ' *', 'price', { placeholder: '15000', keyboardType: 'numeric', required: true })}
            {renderInput(t.post.mileage, 'mileage', { placeholder: '50000', keyboardType: 'numeric' })}
            {renderPickerButton(t.post.condition + ' *', 'condition', t.post.selectCondition)}
            {renderPickerButton(t.post.vehicleType + ' *', 'vehicleType', t.post.selectType)}
          </View>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <View style={styles.stepCard}>
            {renderPickerButton(t.post.fuelType + ' *', 'fuelType', t.post.selectFuelType)}
            {renderPickerButton(t.post.transmission + ' *', 'transmission', t.post.selectTransmission)}
            {renderPickerButton(t.post.drivetrain, 'drivetrain', t.post.selectDrivetrain)}
            {renderInput(t.post.engineSize, 'engineSize', { placeholder: '1998', keyboardType: 'numeric' })}
            {renderInput(t.post.horsepower, 'horsePower', { placeholder: '150', keyboardType: 'numeric' })}
            {renderInput(t.post.color, 'color', { placeholder: t.post.colorPlaceholder })}
            {renderInput(t.post.interiorColor, 'interiorColor', { placeholder: t.post.interiorColorPlaceholder })}
            {renderInput(t.post.doors, 'doors', { placeholder: '4', keyboardType: 'numeric' })}
            {renderInput(t.post.seats, 'seats', { placeholder: '5', keyboardType: 'numeric' })}
          </View>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <View style={styles.stepCard}>
            {renderInput(t.post.description, 'description', {
              placeholder: t.post.describeCar,
              multiline: true,
            })}

            <Text style={styles.sectionTitle}>{t.post.features}</Text>
            <View style={styles.chipGrid}>
              {COMMON_FEATURES.map((f) => (
                <Pressable
                  key={f}
                  style={[styles.chip, form.features.includes(f) && styles.chipActive]}
                  onPress={() => toggleFeature(f)}
                >
                  <Text style={[styles.chipText, form.features.includes(f) && styles.chipTextActive]}>{t.featureLabels[f] || f}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t.post.safetyFeatures}</Text>
            <View style={styles.chipGrid}>
              {COMMON_SAFETY.map((f) => (
                <Pressable
                  key={f}
                  style={[styles.chip, form.safetyFeatures.includes(f) && styles.chipActive]}
                  onPress={() => toggleSafety(f)}
                >
                  <Text style={[styles.chipText, form.safetyFeatures.includes(f) && styles.chipTextActive]}>{t.safetyLabels[f] || f}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}>{t.post.photos} ({images.length}/20)</Text>
            <View style={styles.imageGrid}>
              {images.map((img, i) => (
                <View key={i} style={styles.imageThumb}>
                  <Image source={{ uri: img.uri }} style={styles.imageThumbImg} />
                  <Pressable style={styles.imageRemove} onPress={() => removeImage(i)}>
                    <Ionicons name="close-circle" size={22} color={COLORS.error} />
                  </Pressable>
                  {i === 0 && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>{t.post.main}</Text>
                    </View>
                  )}
                </View>
              ))}
              {images.length < 20 && (
                <View style={styles.addImageButtons}>
                  <Pressable style={styles.addImageButton} onPress={pickImages}>
                    <Ionicons name="images-outline" size={24} color={COLORS.textMuted} />
                    <Text style={styles.addImageText}>{t.post.gallery}</Text>
                  </Pressable>
                  <Pressable style={styles.addImageButton} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={24} color={COLORS.textMuted} />
                    <Text style={styles.addImageText}>{t.post.camera}</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>{t.post.contactAndLocation}</Text>
            {renderInput(t.post.location + ' *', 'location', { placeholder: t.post.locationPlaceholder, required: true })}
            {renderInput(t.post.city, 'city', { placeholder: t.post.cityPlaceholder })}
            {renderInput(t.post.phone, 'contactPhone', { placeholder: t.post.phonePlaceholder, keyboardType: 'phone-pad' })}
            {renderInput(t.post.email, 'contactEmail', { placeholder: t.post.emailContactPlaceholder, keyboardType: 'email-address' })}

            <Text style={styles.sectionTitle}>{t.post.options}</Text>
            {renderToggle(t.post.priceNegotiable, 'priceNegotiable')}
            {renderToggle(t.post.acceptsTradeIn, 'acceptsTradeIn')}
            {renderToggle(t.post.allowTestDrive, 'allowTestDrive')}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable style={styles.backButton} onPress={prevStep}>
            <Ionicons name="arrow-back" size={18} color={COLORS.text} />
            <Text style={styles.backButtonText}>{t.common.back}</Text>
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={styles.spacer} />
        {step < steps.length - 1 ? (
          <Pressable style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>{t.common.next}</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <View style={styles.submitProgressRow}>
                <ActivityIndicator color={COLORS.white} size="small" />
                {uploadProgress ? <Text style={styles.submitProgressText}>{uploadProgress}</Text> : null}
              </View>
            ) : (
              <Text style={styles.submitButtonText}>{t.post.postListing}</Text>
            )}
          </Pressable>
        )}
      </View>

      {/* Picker Overlay */}
      {pickerVisible && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={styles.overlay} onPress={() => setPickerVisible(false)} />
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{(() => {
                const pickerTitleMap: Record<string, string> = {
                  make: t.post.make, vehicleType: t.post.vehicleType, condition: t.post.condition,
                  fuelType: t.post.fuelType, transmission: t.post.transmission, drivetrain: t.post.drivetrain,
                };
                return pickerTitleMap[pickerField] || formatEnum(pickerField);
              })()}</Text>
              <Pressable onPress={() => setPickerVisible(false)} style={styles.pickerCloseBtn}>
                <Ionicons name="close" size={20} color={COLORS.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList}>
              {getPickerOptions().map((opt) => (
                <Pressable
                  key={opt.value}
                  style={styles.pickerItem}
                  onPress={() => {
                    updateForm(pickerField as keyof CarFormData, opt.value);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    form[pickerField as keyof CarFormData] === opt.value && styles.pickerItemSelected,
                  ]}>
                    {opt.label}
                  </Text>
                  {form[pickerField as keyof CarFormData] === opt.value && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundMuted },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderZinc,
  },
  progressStep: { flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 24, height: 24, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.zinc200,
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: COLORS.black },
  progressDotText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  progressDotTextActive: { color: COLORS.white },
  progressLabel: { fontSize: FONT_SIZE.xs, color: COLORS.text, fontWeight: '500', marginLeft: 4, marginRight: 4 },
  progressLine: { width: 20, height: 2, backgroundColor: COLORS.zinc200, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: COLORS.black },

  // Body
  body: { flex: 1 },
  bodyContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    padding: SPACING.md,
  },

  // Form fields
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 16,
    height: 48,
    fontSize: FONT_SIZE.sm, color: COLORS.text,
  },
  inputMultiline: {
    borderRadius: BORDER_RADIUS['2xl'],
    minHeight: 100,
    textAlignVertical: 'top',
    paddingVertical: 12,
    height: undefined,
  },
  selectButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 16, height: 48,
  },
  selectText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  selectPlaceholder: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },

  sectionTitle: {
    fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text,
    marginTop: SPACING.lg, marginBottom: SPACING.sm,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.zinc100,
  },
  chipActive: { backgroundColor: COLORS.black },
  chipText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white, fontWeight: '500' },

  // Toggle
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.borderZinc,
  },
  toggleLabel: { fontSize: FONT_SIZE.md, color: COLORS.text },
  toggleSwitch: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: COLORS.zinc200, justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleSwitchActive: { backgroundColor: COLORS.black },
  toggleThumb: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.white,
  },
  toggleThumbActive: { alignSelf: 'flex-end' },

  // Images
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  imageThumb: { width: 100, height: 75, borderRadius: BORDER_RADIUS.md, overflow: 'hidden', position: 'relative' },
  imageThumbImg: { width: '100%', height: '100%' },
  imageRemove: { position: 'absolute', top: 2, right: 2 },
  mainBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.black, paddingVertical: 2, alignItems: 'center',
  },
  mainBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  addImageButtons: { flexDirection: 'row', gap: SPACING.sm },
  addImageButton: {
    width: 100, height: 75, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.zinc200, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: COLORS.zinc50,
  },
  addImageText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontWeight: '500' },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.borderZinc, backgroundColor: COLORS.white,
  },
  backButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.zinc100, borderRadius: BORDER_RADIUS.full,
    height: 44, paddingHorizontal: 16,
  },
  backButtonText: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '500' },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.black, borderRadius: BORDER_RADIUS.full,
    height: 44, paddingHorizontal: 20,
  },
  nextButtonText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  submitButton: {
    backgroundColor: COLORS.black, borderRadius: BORDER_RADIUS.full,
    height: 44, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center',
  },
  submitButtonText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  buttonDisabled: { opacity: 0.5 },
  spacer: { flex: 1 },
  submitProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitProgressText: { color: COLORS.white, fontSize: FONT_SIZE.xs },

  // Picker
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerModal: {
    position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '60%',
    backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS['2xl'], borderTopRightRadius: BORDER_RADIUS['2xl'],
  },
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderZinc,
  },
  pickerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '500', color: COLORS.text },
  pickerCloseBtn: {
    width: 32, height: 32, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.zinc100, alignItems: 'center', justifyContent: 'center',
  },
  pickerList: { maxHeight: 400 },
  pickerItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.borderZinc,
  },
  pickerItemText: { fontSize: FONT_SIZE.md, color: COLORS.text },
  pickerItemSelected: { color: COLORS.primary, fontWeight: '600' },
});
