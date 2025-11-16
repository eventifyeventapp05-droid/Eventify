import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {getOrganizers} from '../../redux/slices/organizerSlice';
import {createEvent} from '../../redux/slices/eventSlice';
import ImagePicker from 'react-native-image-crop-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';

import InputField from '../../utils/customComponents/customInputField/InputField';
import Button from '../../utils/customComponents/customButton/Button';
import {theme} from '../../styles/theme';

const {width} = Dimensions.get('screen');
const PADDING = 24;
const CARD_RADIUS = 20;
const SECTIONS = ['Basic Info', 'Venue & Date', 'Tickets', 'Images & Extras'];

const CreateEvent = ({navigation}) => {
  const dispatch = useDispatch();
  const organizers = useSelector(state => state.organizers.organizers || []);
  const eventsLoading = useSelector(state => state.events.loading);

  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const progressAnim = new Animated.Value(0);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [type, setType] = useState(null);
  const [organizerId, setOrganizerId] = useState(null);
  const [venue, setVenue] = useState({name: '', address: '', city: ''});
  const [dateTime, setDateTime] = useState({start: '', end: ''});
  const [ticketConfig, setTicketConfig] = useState({
    isRegistrationRequired: false,
    maxAttendees: '',
    ticketTypes: [{name: '', price: '', quantity: ''}],
    showTickets: true,
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [eventImages, setEventImages] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [captions, setCaptions] = useState('');
  const [errors, setErrors] = useState({});

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (activeSection + 1) / SECTIONS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [activeSection]);

  useEffect(() => {
    dispatch(getOrganizers());
  }, [dispatch]);

  const showToast = (message, type = 'error') => {
    Alert.alert(type === 'error' ? 'Error' : 'Success', message);
  };

  /* ==================== IMAGE HANDLING ==================== */
  const handleImagesSelect = async () => {
    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        maxFiles: 5,
        mediaType: 'photo',
      });
      const files = images.map(asset => ({
        uri: asset.path,
        type: asset.mime,
        name:
          asset.filename ||
          `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${
            asset.mime.split('/')[1] || 'jpg'
          }`,
      }));
      setEventImages(files.slice(0, 5));
      setPrimaryIndex(0);
    } catch (err) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        showToast('Image selection failed');
      }
    }
  };

  const removeImage = index => {
    const updated = eventImages.filter((_, i) => i !== index);
    setEventImages(updated);
    if (primaryIndex >= updated.length) {
      setPrimaryIndex(Math.max(0, updated.length - 1));
    }
  };

  /* ==================== TICKET HANDLERS ==================== */
  const handleAddTicket = () => {
    setTicketConfig(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, {name: '', price: '', quantity: ''}],
    }));
  };

  const handleRemoveTicket = idx => {
    if (ticketConfig.ticketTypes.length === 1) return;
    setTicketConfig(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== idx),
    }));
  };

  const handleTicketChange = (idx, field, value) => {
    const updated = [...ticketConfig.ticketTypes];
    updated[idx] = {...updated[idx], [field]: value};
    setTicketConfig(prev => ({...prev, ticketTypes: updated}));
  };

  /* ==================== VALIDATION ==================== */
  const validateCurrentSection = () => {
    const sectionErrors = {};
    if (activeSection === 0) {
      if (!title.trim()) sectionErrors.title = 'Title is required';
      if (!description.trim())
        sectionErrors.description = 'Description is required';
      if (!category) sectionErrors.category = 'Category is required';
      if (!type) sectionErrors.type = 'Type is required';
      if (!organizerId) sectionErrors.organizerId = 'Organizer is required';
    } else if (activeSection === 1) {
      if (!venue.name.trim())
        sectionErrors.venueName = 'Venue name is required';
      if (!venue.address.trim())
        sectionErrors.venueAddress = 'Venue address is required';
      if (!venue.city.trim())
        sectionErrors.venueCity = 'Venue city is required';
      if (!dateTime.start) sectionErrors.startDate = 'Start date is required';
      if (!dateTime.end) sectionErrors.endDate = 'End date is required';
    } else if (activeSection === 2) {
      if (!ticketConfig.maxAttendees || Number(ticketConfig.maxAttendees) <= 0)
        sectionErrors.maxAttendees = 'Max attendees must be > 0';

      ticketConfig.ticketTypes.forEach((t, i) => {
        if (!t.name.trim())
          sectionErrors[`ticketName${i}`] = `Ticket ${i + 1} name required`;
        if (!t.price || Number(t.price) <= 0)
          sectionErrors[`ticketPrice${i}`] = `Ticket ${
            i + 1
          } price must be > 0`;
        if (!t.quantity || Number(t.quantity) <= 0)
          sectionErrors[`ticketQty${i}`] = `Ticket ${
            i + 1
          } quantity must be > 0`;
      });
    } else if (activeSection === 3) {
      if (eventImages.length === 0)
        sectionErrors.images = 'Upload at least 1 image';
    }

    setErrors(sectionErrors);
    if (Object.keys(sectionErrors).length > 0) {
      Object.values(sectionErrors).forEach(err => showToast(err));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentSection())
      setActiveSection(p => Math.min(p + 1, SECTIONS.length - 1));
  };

  const handlePrev = () => setActiveSection(p => Math.max(p - 1, 0));

  const handleCreateEvent = async () => {
    if (!validateCurrentSection()) return;

    setLoading(true);
    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('type', type);
    formData.append('organizerId', organizerId);
    formData.append('venue', JSON.stringify(venue));
    formData.append('dateTime', JSON.stringify(dateTime));
    formData.append('status', 'DRAFT');
    formData.append('isFeatured', isFeatured ? 'true' : 'false');
    formData.append('primaryIndex', primaryIndex.toString());
    formData.append('captions', captions);

    const payloadTicketConfig = {
      ...ticketConfig,
      maxAttendees: Number(ticketConfig.maxAttendees),
      ticketTypes: ticketConfig.ticketTypes.map(t => ({
        name: t.name.trim(),
        price: Number(t.price),
        quantity: Number(t.quantity),
      })),
    };
    formData.append('ticketConfig', JSON.stringify(payloadTicketConfig));

    eventImages.forEach(img => {
      formData.append('eventImage', {
        uri: img.uri,
        type: img.type || 'image/jpeg',
        name: img.name || `img_${Date.now()}.jpg`,
      });
    });

    try {
      const res = await dispatch(createEvent(formData));
      if (createEvent.fulfilled.match(res)) {
        showToast('Event created successfully', 'success');
        resetForm();
      } else {
        showToast(res.payload?.message || 'Failed to create event');
      }
    } catch (err) {
      showToast('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(null);
    setType(null);
    setOrganizerId(null);
    setVenue({name: '', address: '', city: ''});
    setDateTime({start: '', end: ''});
    setTicketConfig({
      isRegistrationRequired: false,
      maxAttendees: '',
      ticketTypes: [{name: '', price: '', quantity: ''}],
      showTickets: true,
    });
    setIsFeatured(false);
    setEventImages([]);
    setPrimaryIndex(0);
    setCaptions('');
    setActiveSection(0);
    setErrors({});
  };

  /* ==================== DROPDOWN OPTIONS ==================== */
  const categoryOptions = useMemo(
    () => [
      {label: 'Concert', value: 'CONCERT'},
      {label: 'Seminar', value: 'SEMINAR'},
      {label: 'Live Show', value: 'LIVE_SHOW'},
      {label: 'Theater', value: 'THEATER'},
      {label: 'Cultural', value: 'CULTURAL'},
    ],
    [],
  );

  const typeOptions = useMemo(
    () => [
      {label: 'City', value: 'CITY'},
      {label: 'Out of City', value: 'OUT_OF_CITY'},
    ],
    [],
  );

  const organizerOptions = useMemo(
    () => organizers.map(o => ({label: o.userName, value: o._id})),
    [organizers],
  );

  /* ==================== SECTION RENDERERS ==================== */
  const renderBasicInfo = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Basic Information</Text>

      <InputField
        value={title}
        onChangeText={setTitle}
        placeholder="Event Title"
        error={errors.title}
      />
      <InputField
        value={description}
        onChangeText={setDescription}
        placeholder="Short description"
        multiline
        inputStyle={{height: 110}}
        error={errors.description}
      />
      <InputField
        dropdownOptions={categoryOptions}
        selectedValue={category}
        onValueChange={setCategory}
        placeholder="Select Category"
        error={errors.category}
      />
      <InputField
        dropdownOptions={typeOptions}
        selectedValue={type}
        onValueChange={setType}
        placeholder="Select Event Type"
        error={errors.type}
      />
      <InputField
        dropdownOptions={organizerOptions}
        selectedValue={organizerId}
        onValueChange={setOrganizerId}
        placeholder="Select Organizer"
        error={errors.organizerId}
      />
    </View>
  );

  const renderVenueDate = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Venue & Schedule</Text>

      <InputField
        value={venue.name}
        onChangeText={v => setVenue({...venue, name: v})}
        placeholder="Venue Name"
        error={errors.venueName}
      />
      <InputField
        value={venue.address}
        onChangeText={v => setVenue({...venue, address: v})}
        placeholder="Address"
        error={errors.venueAddress}
      />
      <InputField
        value={venue.city}
        onChangeText={v => setVenue({...venue, city: v})}
        placeholder="City"
        error={errors.venueCity}
      />
      <InputField
        value={dateTime.start}
        onChangeText={v => setDateTime({...dateTime, start: v})}
        placeholder="Start Date & Time (YYYY-MM-DDTHH:mm)"
        error={errors.startDate}
      />
      <InputField
        value={dateTime.end}
        onChangeText={v => setDateTime({...dateTime, end: v})}
        placeholder="End Date & Time (YYYY-MM-DDTHH:mm)"
        error={errors.endDate}
      />
    </View>
  );

  const renderTickets = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Tickets & Attendance</Text>

      <InputField
        value={ticketConfig.maxAttendees}
        onChangeText={v => setTicketConfig({...ticketConfig, maxAttendees: v})}
        placeholder="Max Attendees"
        keyboardType="numeric"
        error={errors.maxAttendees}
      />

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() =>
          setTicketConfig(p => ({
            ...p,
            isRegistrationRequired: !p.isRegistrationRequired,
          }))
        }>
        <Ionicons
          name={
            ticketConfig.isRegistrationRequired ? 'checkbox' : 'square-outline'
          }
          size={24}
          color={theme.colors.primary}
        />
        <Text style={styles.checkboxLabel}>Registration Required</Text>
      </TouchableOpacity>

      <View style={styles.ticketHeader}>
        <View style={styles.ticketToggle}>
          <FontAwesome5
            name="ticket-alt"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.ticketTitle}>
            Ticket Types
            <Text style={styles.badge}> {ticketConfig.ticketTypes.length}</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddTicket}>
          <FontAwesome5 name="plus" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      {ticketConfig.ticketTypes.map((t, i) => (
        <View key={i} style={styles.ticketRow}>
          <TextInput
            style={[
              styles.ticketInput,
              errors[`ticketName${i}`] && styles.inputError,
            ]}
            placeholder="Name"
            value={t.name}
            onChangeText={v => handleTicketChange(i, 'name', v)}
          />
          <TextInput
            style={[
              styles.ticketInput,
              errors[`ticketPrice${i}`] && styles.inputError,
            ]}
            placeholder="Price"
            keyboardType="numeric"
            value={t.price?.toString()}
            onChangeText={v => handleTicketChange(i, 'price', v)}
          />
          <TextInput
            style={[
              styles.ticketInput,
              errors[`ticketQty${i}`] && styles.inputError,
            ]}
            placeholder="Qty"
            keyboardType="numeric"
            value={t.quantity?.toString()}
            onChangeText={v => handleTicketChange(i, 'quantity', v)}
          />
          {ticketConfig.ticketTypes.length > 1 && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemoveTicket(i)}>
              <FontAwesome5 name="trash-alt" size={18} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  const renderImages = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Images & Final Touches</Text>

      <TouchableOpacity style={styles.imageUpload} onPress={handleImagesSelect}>
        {eventImages.length > 0 ? (
          <View style={styles.imageGrid}>
            {eventImages.map((img, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                onPress={() => setPrimaryIndex(i)}
                style={[
                  styles.imageItem,
                  i === primaryIndex && styles.primaryImage,
                ]}>
                <Image source={{uri: img.uri}} style={styles.previewImg} />
                <View style={styles.overlay}>
                  {i === primaryIndex && (
                    <Text style={styles.primaryTag}>Primary</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeImage(i)}>
                  <FontAwesome5 name="times-circle" size={22} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <FontAwesome5 name="images" size={56} color="#9b2c2c" />
            <Text style={styles.uploadText}>Tap to upload up to 5 images</Text>
            <Text style={styles.uploadSub}>JPG, PNG, WebP</Text>
          </View>
        )}
      </TouchableOpacity>

      <InputField
        value={captions}
        onChangeText={setCaptions}
        placeholder="Captions (comma separated)"
      />

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setIsFeatured(p => !p)}>
        <Ionicons
          name={isFeatured ? 'checkbox' : 'square-outline'}
          size={24}
          color="#F59E0B"
        />
        <Text style={styles.checkboxLabel}>Feature this Event</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#fffbeb', '#fef3c7', '#fde68a']}
      style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Event</Text>
          <Text style={styles.subtitle}>
            Step {activeSection + 1} of {SECTIONS.length}
          </Text>
        </View>

        {/* Progress Line */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          {SECTIONS.map((_, i) => (
            <Text
              key={i}
              style={[
                styles.stepNumber,
                i === activeSection && styles.activeStepNumber,
              ]}>
              {i + 1}
            </Text>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {activeSection === 0 && renderBasicInfo()}
          {activeSection === 1 && renderVenueDate()}
          {activeSection === 2 && renderTickets()}
          {activeSection === 3 && renderImages()}

          {/* Navigation Buttons */}
          <View style={styles.buttonRow}>
            {activeSection > 0 ? (
              <Button
                title="Previous"
                onPress={handlePrev}
                backgroundColor="#fff"
                textColor={theme.colors.primary}
                width={width / 2 - PADDING - 8}
                style={styles.prevBtn}
              />
            ) : (
              <View style={{width: width / 2 - PADDING - 8}} />
            )}

            <Button
              title={
                activeSection === SECTIONS.length - 1 ? 'Create Event' : 'Next'
              }
              onPress={
                activeSection === SECTIONS.length - 1
                  ? handleCreateEvent
                  : handleNext
              }
              loading={loading || eventsLoading}
              backgroundColor={theme.colors.primary}
              textColor="#fff"
              width={activeSection === 0 ? '100%' : width / 2 - PADDING - 8}
              gradient={['#c2410c', '#ea580c']}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default CreateEvent;

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  gradient: {flex: 1},
  header: {
    paddingHorizontal: PADDING,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#7c2d12',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#92400e',
    marginTop: 4,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    marginBottom: 20,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#fecaca',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ea580c',
    borderRadius: 3,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '600',
    color: '#666',
    fontSize: 14,
  },
  activeStepNumber: {
    backgroundColor: '#ea580c',
    color: '#fff',
  },

  scrollContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },

  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },

  /* Tickets */
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingBottom: 8,
  },
  ticketToggle: {flexDirection: 'row', alignItems: 'center'},
  ticketTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#ea580c',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 6,
  },
  addBtn: {
    backgroundColor: '#ea580c',
    padding: 10,
    borderRadius: 12,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#ea580c',
  },
  ticketInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  removeBtn: {marginLeft: 8},

  /* Image Upload */
  imageUpload: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#fed7aa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    minHeight: 160,
    marginBottom: 16,
  },
  uploadPlaceholder: {alignItems: 'center'},
  uploadText: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '600',
    color: '#7c2d12',
  },
  uploadSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  imageItem: {
    width: (width - PADDING * 2 - 48) / 3,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  primaryImage: {borderColor: '#ea580c'},
  previewImg: {width: '100%', height: '100%'},
  overlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    alignItems: 'center',
  },
  primaryTag: {
    backgroundColor: '#ea580c',
    color: '#fff',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 4,
  },

  /* Buttons */
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  prevBtn: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
});
