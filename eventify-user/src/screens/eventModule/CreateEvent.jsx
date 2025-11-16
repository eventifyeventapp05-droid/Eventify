import React, {useState, useEffect, useMemo, useRef} from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {getOrganizers} from '../../redux/slices/organizerSlice';
import {createEvent} from '../../redux/slices/eventSlice';
import InputField from '../../utils/customComponents/customInputField/InputField';
import Button from '../../utils/customComponents/customButton/Button';
import {DateTimePickerField} from '../../utils/customComponents/customDateTime/DateTimePickerField';
import DateTimePicker from '@react-native-community/datetimepicker';
import {theme} from '../../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ImagePicker from 'react-native-image-crop-picker';

const {width} = Dimensions.get('screen');
const PADDING = 24;
const CARD_RADIUS = 20;
const SECTIONS = ['Basic Info', 'Venue & Date', 'Tickets', 'Images & Extras'];

const CreateEvent = () => {
  const dispatch = useDispatch();
  const organizers = useSelector(state => state.organizers.organizers || []);

  const [activeSection, setActiveSection] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [type, setType] = useState(null);
  const [organizerId, setOrganizerId] = useState(null);

  // Step 2: Venue & Date
  const [venue, setVenue] = useState({name: '', address: '', city: ''});
  const [dateTime, setDateTime] = useState({
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000), // +1 hour
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSettingStartTime, setIsSettingStartTime] = useState(false);
  const [currentPickerMode, setCurrentPickerMode] = useState('date'); // 'date' or 'time'

  // Step 3: Tickets
  const [ticketConfig, setTicketConfig] = useState({
    isRegistrationRequired: false,
    maxAttendees: '',
    ticketTypes: [{name: '', price: '', quantity: ''}],
    showTickets: true,
  });

  // Step 4: Images & Extras
  const [isFeatured, setIsFeatured] = useState(false);
  const [eventImages, setEventImages] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [captions, setCaptions] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  // Fetch organizers
  useEffect(() => {
    dispatch(getOrganizers());
  }, [dispatch]);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (activeSection + 1) / SECTIONS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [activeSection]);

  const showToast = (message, type = 'error') => {
    Alert.alert(type === 'error' ? 'Error' : 'Success', message);
  };

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

  const handleNext = () => {
    if (validateCurrentSection()) {
      setActiveSection(prev => Math.min(prev + 1, SECTIONS.length - 1));
    }
  };

  const handlePrev = () => {
    setActiveSection(prev => Math.max(prev - 1, 0));
  };

  /* ================== DateTimePicker Handlers ================== */
  const handleStartDateTimePress = () => {
    if (Platform.OS === 'ios') {
      setShowStartDatePicker(true);
    } else {
      // For Android, show date picker first
      setCurrentPickerMode('date');
      setIsSettingStartTime(true);
      setShowStartDatePicker(true);
    }
  };

  const handleEndDateTimePress = () => {
    if (Platform.OS === 'ios') {
      setShowEndDatePicker(true);
    } else {
      // For Android, show date picker first
      setCurrentPickerMode('date');
      setIsSettingStartTime(false);
      setShowEndDatePicker(true);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const isStart = isSettingStartTime;

    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        // iOS handles datetime in one picker
        setDateTime(prev => ({
          ...prev,
          [isStart ? 'start' : 'end']: selectedDate,
        }));
      } else {
        // Android - handle based on current mode
        if (currentPickerMode === 'date') {
          const target = isStart
            ? new Date(dateTime.start)
            : new Date(dateTime.end);
          target.setFullYear(selectedDate.getFullYear());
          target.setMonth(selectedDate.getMonth());
          target.setDate(selectedDate.getDate());

          setDateTime(prev => ({
            ...prev,
            [isStart ? 'start' : 'end']: target,
          }));

          // After date selection, show time picker
          setCurrentPickerMode('time');
          if (isStart) {
            setShowStartDatePicker(true);
          } else {
            setShowEndDatePicker(true);
          }
        } else if (currentPickerMode === 'time') {
          const target = isStart
            ? new Date(dateTime.start)
            : new Date(dateTime.end);
          target.setHours(selectedDate.getHours());
          target.setMinutes(selectedDate.getMinutes());

          setDateTime(prev => ({
            ...prev,
            [isStart ? 'start' : 'end']: target,
          }));

          // Reset mode for next selection
          setCurrentPickerMode('date');
        }
      }
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedTime) {
      const key = isSettingStartTime ? 'start' : 'end';
      const newDate = new Date(dateTime[key]);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());

      setDateTime(prev => ({...prev, [key]: newDate}));
    }
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

  /* ================== Render Sections ================== */
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

      {/* START DATE & TIME */}
      <DateTimePickerField
        label="Start Date & Time"
        value={dateTime.start}
        placeholder="Select start date & time"
        show={showStartDatePicker}
        onPress={handleStartDateTimePress}
        onChange={handleDateChange}
        mode={Platform.OS === 'ios' ? 'datetime' : currentPickerMode}
        minimumDate={new Date()}
        error={errors.startDate}
      />

      {/* END DATE & TIME */}
      <DateTimePickerField
        label="End Date & Time"
        value={dateTime.end}
        placeholder="Select end date & time"
        show={showEndDatePicker}
        onPress={handleEndDateTimePress}
        onChange={handleDateChange}
        mode={Platform.OS === 'ios' ? 'datetime' : currentPickerMode}
        minimumDate={dateTime.start || new Date()}
        error={errors.endDate}
      />

      {/* Android Time Picker (Fallback) */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={isSettingStartTime ? dateTime.start : dateTime.end}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
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
            placeholderTextColor={'#000'}
            value={t.name}
            onChangeText={v => handleTicketChange(i, 'name', v)}
          />
          <TextInput
            style={[
              styles.ticketInput,
              errors[`ticketPrice${i}`] && styles.inputError,
            ]}
            placeholder="Price"
            placeholderTextColor={'#000'}
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
            placeholderTextColor={'#000'}
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

  const renderImagesExtras = () => (
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
      style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Event</Text>
              <Text style={styles.subtitle}>
                Step {activeSection + 1} of {SECTIONS.length}
              </Text>
            </View>

            {/* Progress Bar */}
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
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              {activeSection === 0 && renderBasicInfo()}
              {activeSection === 1 && renderVenueDate()}
              {activeSection === 2 && renderTickets()}
              {activeSection === 3 && renderImagesExtras()}

              {/* Navigation Buttons */}
              <View style={styles.buttonRow}>
                {activeSection > 0 && (
                  <Button
                    title="Previous"
                    onPress={handlePrev}
                    backgroundColor="#fff"
                    textColor={theme.colors.primary}
                    width={width / 2 - PADDING - 8}
                  />
                )}
                <Button
                  title={
                    activeSection === SECTIONS.length - 1
                      ? 'Create Event'
                      : 'Next'
                  }
                  onPress={
                    activeSection === SECTIONS.length - 1
                      ? handleCreateEvent
                      : handleNext
                  }
                  loading={loading}
                  backgroundColor={theme.colors.primary}
                  textColor="#fff"
                  width={
                    activeSection === 0
                      ? width - PADDING * 2
                      : width / 2 - PADDING - 8
                  }
                  style={{marginLeft: activeSection > 0 ? 16 : 0}}
                />
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default CreateEvent;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: PADDING,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#7c2d12',
  },
  subtitle: {
    fontSize: 16,
    color: '#92400e',
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: PADDING,
    marginBottom: 20,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#fecaca',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ea580c',
    borderRadius: 3,
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
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
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
