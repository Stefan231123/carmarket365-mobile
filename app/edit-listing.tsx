import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator,
  Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';
import { formatEnum, translateEnum } from '../src/utils/formatters';
import { uploadImageToS3 } from '../src/utils/s3-upload';
import { useLanguage } from '../src/context/LanguageContext';
import { CAR_MAKES, COMMON_FEATURES, COMMON_SAFETY } from '../src/constants/car-data';
import { VehicleType, FuelType, TransmissionType, CarCondition, DrivetrainType } from '../src/constants/enums';

const GET_CAR = gql`
  query GetCarById($id: String!) {
    getCarById(id: $id) {
      id
      make model variant year price mileage
      condition vehicleType fuelType transmission drivetrain
      engineSize horsePower color interiorColor doors seats
      description features safetyFeatures
      location city contactPhone contactEmail
      priceNegotiable acceptsTradeIn allowTestDrive
      images { id url isMain sortOrder }
    }
  }
`;

const UPDATE_CAR = gql`
  mutation UpdateCar($id: String!, $input: UpdateCarInput!) {
    updateCar(id: $id, input: $input) {
      id make model variant year price mileage
      condition vehicleType fuelType transmission
    }
  }
`;

const CREATE_CAR_IMAGE = gql`
  mutation CreateCarImage($input: CreateCarImageInput!) {
    createCarImage(input: $input) { id url isMain sortOrder }
  }
`;

const DELETE_CAR_IMAGE = gql`
  mutation DeleteCarImage($id: String!) {
    deleteCarImage(id: $id)
  }
`;

interface EditFormData {
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


export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { data, loading: fetching } = useQuery(GET_CAR, { variables: { id }, skip: !id });
  const client = useApolloClient();
  const [updateCar] = useMutation(UPDATE_CAR);
  const [createCarImage] = useMutation(CREATE_CAR_IMAGE);
  const [deleteCarImage] = useMutation(DELETE_CAR_IMAGE);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState('');
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; isMain: boolean }[]>([]);
  const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const [form, setForm] = useState<EditFormData>({
    make: '', model: '', variant: '', year: '', price: '', mileage: '',
    condition: 'USED', vehicleType: 'CAR', fuelType: '', transmission: '',
    drivetrain: '', engineSize: '', horsePower: '', color: '', interiorColor: '',
    doors: '', seats: '', description: '', features: [], safetyFeatures: [],
    contactPhone: '', contactEmail: '', location: '', city: '',
    priceNegotiable: false, acceptsTradeIn: false, allowTestDrive: false,
  });

  // Pre-fill form when car data loads
  useEffect(() => {
    const car = (data as any)?.getCarById;
    if (!car) return;
    setForm({
      make: car.make || '',
      model: car.model || '',
      variant: car.variant || '',
      year: String(car.year || ''),
      price: String(car.price || ''),
      mileage: String(car.mileage || ''),
      condition: car.condition || 'USED',
      vehicleType: car.vehicleType || 'CAR',
      fuelType: car.fuelType || '',
      transmission: car.transmission || '',
      drivetrain: car.drivetrain || '',
      engineSize: car.engineSize ? String(car.engineSize) : '',
      horsePower: car.horsePower ? String(car.horsePower) : '',
      color: car.color || '',
      interiorColor: car.interiorColor || '',
      doors: car.doors ? String(car.doors) : '',
      seats: car.seats ? String(car.seats) : '',
      description: car.description || '',
      features: car.features || [],
      safetyFeatures: car.safetyFeatures || [],
      contactPhone: car.contactPhone || '',
      contactEmail: car.contactEmail || '',
      location: car.location || '',
      city: car.city || '',
      priceNegotiable: car.priceNegotiable || false,
      acceptsTradeIn: car.acceptsTradeIn || false,
      allowTestDrive: car.allowTestDrive || false,
    });
    setExistingImages(
      (car.images || [])
        .slice()
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((img: any) => ({ id: img.id, url: img.url, isMain: img.isMain }))
    );
  }, [data]);

  const updateForm = (field: keyof EditFormData, value: string | boolean | string[]) => {
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
    const totalImages = existingImages.length + newImages.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 20 - totalImages,
    });
    if (!result.canceled) {
      setNewImages((prev) => [...prev, ...result.assets].slice(0, 20 - existingImages.length));
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    Alert.alert(t.common.delete, t.myListings.cannotBeUndone, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCarImage({ variables: { id: imageId } });
            setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
          } catch (err: any) {
            Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!form.make || !form.model.trim() || !form.year || !form.price || !form.location.trim()) {
      Alert.alert(t.common.required, t.post.selectMakeAlert);
      return;
    }
    setSaving(true);
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

      await updateCar({ variables: { id, input } });

      // Upload any new images
      let failedUploads = 0;
      if (newImages.length > 0) {
        const startOrder = existingImages.length;
        for (let i = 0; i < newImages.length; i++) {
          setUploadProgress(`${t.post.uploadingImages} (${i + 1}/${newImages.length})...`);
          try {
            const uploaded = await uploadImageToS3(newImages[i].uri, id!, client);
            await createCarImage({
              variables: {
                input: {
                  carId: id,
                  s3Key: uploaded.s3Key,
                  fileName: uploaded.fileName,
                  sortOrder: startOrder + i,
                  isMain: existingImages.length === 0 && i === 0,
                },
              },
            });
          } catch {
            failedUploads++;
          }
        }
      }

      setUploadProgress('');
      if (failedUploads > 0) {
        Alert.alert(t.common.success, `${t.myListings.listingUpdated}\n${failedUploads} image(s) failed to upload.`, [
          { text: t.common.ok, onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t.common.success, t.myListings.listingUpdated, [
          { text: t.common.ok, onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
    } finally {
      setSaving(false);
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

  const renderPickerButton = (label: string, field: keyof EditFormData, placeholder: string) => {
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

  const renderInput = (label: string, field: keyof EditFormData, opts?: {
    placeholder?: string; keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    multiline?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
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

  const renderToggle = (label: string, field: keyof EditFormData) => (
    <Pressable style={styles.toggleRow} onPress={() => updateForm(field, !form[field])}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggleSwitch, form[field] && styles.toggleSwitchActive]}>
        <View style={[styles.toggleThumb, form[field] && styles.toggleThumbActive]} />
      </View>
    </Pressable>
  );

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.post.stepBasicInfo}</Text>
          {renderPickerButton(t.post.make, 'make', t.post.selectMake)}
          {renderInput(t.post.model, 'model', { placeholder: t.post.enterModel })}
          {renderInput(t.post.variant, 'variant', { placeholder: t.post.variantPlaceholder })}
          {renderInput(t.post.year, 'year', { placeholder: '2020', keyboardType: 'numeric' })}
          {renderInput(t.post.price, 'price', { placeholder: '15000', keyboardType: 'numeric' })}
          {renderInput(t.post.mileage, 'mileage', { placeholder: '50000', keyboardType: 'numeric' })}
          {renderPickerButton(t.post.condition, 'condition', t.post.selectCondition)}
          {renderPickerButton(t.post.vehicleType, 'vehicleType', t.post.selectType)}
        </View>

        {/* Technical Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.post.stepDetails}</Text>
          {renderPickerButton(t.post.fuelType, 'fuelType', t.post.selectFuelType)}
          {renderPickerButton(t.post.transmission, 'transmission', t.post.selectTransmission)}
          {renderPickerButton(t.post.drivetrain, 'drivetrain', t.post.selectDrivetrain)}
          {renderInput(t.post.engineSize, 'engineSize', { placeholder: '1998', keyboardType: 'numeric' })}
          {renderInput(t.post.horsepower, 'horsePower', { placeholder: '150', keyboardType: 'numeric' })}
          {renderInput(t.post.color, 'color', { placeholder: t.post.colorPlaceholder })}
          {renderInput(t.post.interiorColor, 'interiorColor', { placeholder: t.post.interiorColorPlaceholder })}
          {renderInput(t.post.doors, 'doors', { placeholder: '4', keyboardType: 'numeric' })}
          {renderInput(t.post.seats, 'seats', { placeholder: '5', keyboardType: 'numeric' })}
        </View>

        {/* Description & Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.post.stepFeatures}</Text>
          {renderInput(t.post.description, 'description', {
            placeholder: t.post.describeCar,
            multiline: true,
          })}

          <Text style={styles.subsectionTitle}>{t.post.features}</Text>
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

          <Text style={styles.subsectionTitle}>{t.post.safetyFeatures}</Text>
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

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.post.photos} ({totalImages}/20)</Text>
          <View style={styles.imageGrid}>
            {existingImages.map((img) => (
              <View key={img.id} style={styles.imageThumb}>
                <Image source={{ uri: img.url }} style={styles.imageThumbImg} />
                {img.isMain && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>{t.post.main}</Text>
                  </View>
                )}
                <Pressable style={styles.imageRemove} onPress={() => removeExistingImage(img.id)}>
                  <Ionicons name="close-circle" size={22} color={COLORS.error} />
                </Pressable>
              </View>
            ))}
            {newImages.map((img, i) => (
              <View key={`new-${i}`} style={styles.imageThumb}>
                <Image source={{ uri: img.uri }} style={styles.imageThumbImg} />
                <Pressable style={styles.imageRemove} onPress={() => removeNewImage(i)}>
                  <Ionicons name="close-circle" size={22} color={COLORS.error} />
                </Pressable>
              </View>
            ))}
            {totalImages < 20 && (
              <Pressable style={styles.addImageButton} onPress={pickImages}>
                <Ionicons name="add-outline" size={28} color={COLORS.textMuted} />
                <Text style={styles.addImageText}>{t.post.gallery}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Contact & Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.post.contactAndLocation}</Text>
          {renderInput(t.post.location, 'location', { placeholder: t.post.locationPlaceholder })}
          {renderInput(t.post.city, 'city', { placeholder: t.post.cityPlaceholder })}
          {renderInput(t.post.phone, 'contactPhone', { placeholder: t.post.phonePlaceholder, keyboardType: 'phone-pad' })}
          {renderInput(t.post.email, 'contactEmail', { placeholder: t.post.emailContactPlaceholder, keyboardType: 'email-address' })}
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.post.options}</Text>
          {renderToggle(t.post.priceNegotiable, 'priceNegotiable')}
          {renderToggle(t.post.acceptsTradeIn, 'acceptsTradeIn')}
          {renderToggle(t.post.allowTestDrive, 'allowTestDrive')}
        </View>
      </ScrollView>

      {/* Save Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <View style={styles.saveProgressRow}>
              <ActivityIndicator color={COLORS.white} size="small" />
              {uploadProgress ? <Text style={styles.saveProgressText}>{uploadProgress}</Text> : null}
            </View>
          ) : (
            <Text style={styles.saveButtonText}>{t.common.save}</Text>
          )}
        </Pressable>
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
                    updateForm(pickerField as keyof EditFormData, opt.value);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    form[pickerField as keyof EditFormData] === opt.value && styles.pickerItemSelected,
                  ]}>
                    {opt.label}
                  </Text>
                  {form[pickerField as keyof EditFormData] === opt.value && (
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1 },
  bodyContent: { padding: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.md },

  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text,
    marginBottom: SPACING.md,
  },
  subsectionTitle: {
    fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text,
    marginTop: SPACING.lg, marginBottom: SPACING.sm,
  },

  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 16, height: 48,
    fontSize: FONT_SIZE.sm, color: COLORS.text,
  },
  inputMultiline: {
    borderRadius: BORDER_RADIUS['2xl'],
    minHeight: 100, textAlignVertical: 'top',
    paddingVertical: 12, height: undefined,
  },
  selectButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 16, height: 48,
  },
  selectText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  selectPlaceholder: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.zinc100,
  },
  chipActive: { backgroundColor: COLORS.black },
  chipText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white, fontWeight: '500' },

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
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.white },
  toggleThumbActive: { alignSelf: 'flex-end' },

  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  imageThumb: { width: 100, height: 75, borderRadius: BORDER_RADIUS.md, overflow: 'hidden', position: 'relative' },
  imageThumbImg: { width: '100%', height: '100%' },
  imageRemove: { position: 'absolute', top: 2, right: 2 },
  mainBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.black, paddingVertical: 2, alignItems: 'center',
  },
  mainBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  addImageButton: {
    width: 100, height: 75, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.zinc200, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: COLORS.zinc50,
  },
  addImageText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontWeight: '500' },

  footer: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.borderZinc, backgroundColor: COLORS.white,
  },
  cancelButton: {
    flex: 1, height: 48, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.zinc100, alignItems: 'center', justifyContent: 'center',
  },
  cancelButtonText: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '500' },
  saveButton: {
    flex: 2, height: 48, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center',
  },
  saveButtonText: { fontSize: FONT_SIZE.sm, color: COLORS.white, fontWeight: '500' },
  buttonDisabled: { opacity: 0.5 },
  saveProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveProgressText: { color: COLORS.white, fontSize: FONT_SIZE.xs },

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
