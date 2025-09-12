import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal,
  StyleSheet
} from 'react-native';
import { useFieldStore } from '../../store/fieldStore';
import { useAuthStore } from '../../store/authStore';
import { Crop, CropStage, Field } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/DesignSystem';

interface CropManagementProps {
  visible: boolean;
  onClose: () => void;
  cropId?: string;
}

export default function CropManagement({ visible, onClose, cropId }: CropManagementProps) {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const { 
    fields, 
    crops, 
    addCrop, 
    updateCrop, 
    deleteCrop,
    setSelectedCrop 
  } = useFieldStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    fieldId: '',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    currentStage: CropStage.PLANTED,
    notes: '',
  });

  const existingCrop = cropId ? crops.find(c => c.id === cropId) : null;

  useEffect(() => {
    if (existingCrop) {
      setIsEditing(true);
      setFormData({
        name: existingCrop.name,
        variety: existingCrop.variety,
        fieldId: existingCrop.fieldId,
        plantingDate: new Date(existingCrop.plantingDate).toISOString().split('T')[0],
        expectedHarvestDate: new Date(existingCrop.expectedHarvestDate).toISOString().split('T')[0],
        currentStage: existingCrop.currentStage,
        notes: existingCrop.notes.join('\n'),
      });
    } else {
      setIsEditing(false);
      setFormData({
        name: '',
        variety: '',
        fieldId: fields.length > 0 ? fields[0].id : '',
        plantingDate: new Date().toISOString().split('T')[0],
        expectedHarvestDate: '',
        currentStage: CropStage.PLANTED,
        notes: '',
      });
    }
  }, [existingCrop, fields, visible]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.variety.trim() || !formData.fieldId) {
      Alert.alert(t('common.error'), t('crop.fillRequiredFields'));
      return;
    }

    const cropData = {
      name: formData.name.trim(),
      variety: formData.variety.trim(),
      fieldId: formData.fieldId,
      plantingDate: new Date(formData.plantingDate),
      expectedHarvestDate: new Date(formData.expectedHarvestDate || formData.plantingDate),
      currentStage: formData.currentStage,
      notes: formData.notes.split('\n').filter(note => note.trim()),
      photos: existingCrop?.photos || [],
      pesticidesUsed: existingCrop?.pesticidesUsed || [],
    };

    if (isEditing && existingCrop) {
      updateCrop(existingCrop.id, cropData, token || '');
    } else {
      addCrop(cropData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!existingCrop) return;

    Alert.alert(
      t('crop.deleteCrop'),
      t('crop.deleteConfirmation', { cropName: existingCrop.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => {
            deleteCrop(existingCrop.id, token || '');
            onClose();
          }
        },
      ]
    );
  };

  const cropStages = Object.values(CropStage);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? t('crop.editCrop') : t('crop.addCrop')}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('crop.basicInformation')}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('crop.cropName')} *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder={t('crop.cropNamePlaceholder')}
                style={styles.input}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('crop.variety')} *</Text>
              <TextInput
                value={formData.variety}
                onChangeText={(text) => setFormData(prev => ({ ...prev, variety: text }))}
                placeholder={t('crop.varietyPlaceholder')}
                style={styles.input}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('field.field')} *</Text>
              <View style={styles.fieldSelector}>
                {fields.map((field, index) => (
                  <TouchableOpacity
                    key={field.id}
                    onPress={() => setFormData(prev => ({ ...prev, fieldId: field.id }))}
                    style={[
                      styles.fieldOption,
                      formData.fieldId === field.id && styles.selectedFieldOption,
                      index === fields.length - 1 && styles.lastFieldOption
                    ]}
                  >
                    <View style={styles.fieldOptionContent}>
                      <View>
                        <Text style={styles.fieldName}>{field.name}</Text>
                        <Text style={styles.fieldSize}>{field.size} {t('field.acres')}</Text>
                      </View>
                      {formData.fieldId === field.id && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('crop.importantDates')}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('crop.plantingDate')} *</Text>
              <TextInput
                value={formData.plantingDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, plantingDate: text }))}
                placeholder="YYYY-MM-DD"
                style={styles.input}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('crop.expectedHarvestDate')}</Text>
              <TextInput
                value={formData.expectedHarvestDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, expectedHarvestDate: text }))}
                placeholder="YYYY-MM-DD"
                style={styles.input}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Current Stage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('crop.currentGrowthStage')}
            </Text>

            <View style={styles.stageContainer}>
              {cropStages.map((stage) => (
                <TouchableOpacity
                  key={stage}
                  onPress={() => setFormData(prev => ({ ...prev, currentStage: stage }))}
                  style={[
                    styles.stageOption,
                    formData.currentStage === stage && styles.selectedStageOption
                  ]}
                >
                  <View style={styles.stageOptionContent}>
                    <Text style={[
                      styles.stageText,
                      formData.currentStage === stage && styles.selectedStageText
                    ]}>
                      {t(`crop.stages.${stage}`)}
                    </Text>
                    {formData.currentStage === stage && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('crop.notes')}
            </Text>

            <TextInput
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder={t('crop.notesPlaceholder')}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.input, styles.textArea]}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          {/* Pesticide Applications */}
          {existingCrop && existingCrop.pesticidesUsed.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('crop.pesticideApplications')}
              </Text>

              {existingCrop.pesticidesUsed.map((application, index) => (
                <View key={application.id} style={[
                  styles.pesticideItem,
                  index === existingCrop.pesticidesUsed.length - 1 && styles.lastPesticideItem
                ]}>
                  <Text style={styles.pesticideName}>{application.pesticideName}</Text>
                  <Text style={styles.pesticideDate}>
                    {t('crop.applied')}: {new Date(application.applicationDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.pesticideDate}>
                    {t('crop.safeToHarvest')}: {new Date(application.safeHarvestDate).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Delete Button */}
          {isEditing && (
            <TouchableOpacity 
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>
                {t('crop.deleteCrop')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    color: Colors.primary,
    fontSize: Typography.bodyLarge,
  },
  headerTitle: {
    fontSize: Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  saveButton: {
    color: Colors.primary,
    fontSize: Typography.bodyLarge,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fieldSelector: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  fieldOption: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  lastFieldOption: {
    borderBottomWidth: 0,
  },
  selectedFieldOption: {
    backgroundColor: Colors.primaryLight,
  },
  fieldOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldName: {
    fontSize: Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  fieldSize: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  checkmark: {
    color: Colors.primary,
    fontSize: Typography.bodyMedium,
  },
  stageContainer: {
    gap: Spacing.sm,
  },
  stageOption: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selectedStageOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  stageOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageText: {
    fontSize: Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  selectedStageText: {
    color: Colors.primary,
  },
  pesticideItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  lastPesticideItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  pesticideName: {
    fontSize: Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  pesticideDate: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  deleteButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.bodyMedium,
    fontWeight: '500',
    textAlign: 'center',
  },
});