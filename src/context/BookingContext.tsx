import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Booking, DoctorSettings, SlotType, BookingState } from '@/types/booking';

interface BookingContextType {
  bookings: Booking[];
  settings: DoctorSettings;
  addBooking: (mobileNumber: string, patientName: string, slotType: SlotType) => { success: boolean; booking?: Booking; error?: string };
  markAsConsulted: (bookingId: string) => void;
  updateSettings: (newSettings: Partial<DoctorSettings>) => void;
  closeBookingsForSlot: (slotType: SlotType) => void;
  getQueueForSlot: (slotType: SlotType) => Booking[];
  hasBookedToday: (mobileNumber: string) => boolean;
  isBookingOpen: (slotType: SlotType) => boolean;
  getEstimatedTime: (slotType: SlotType, queueNumber: number) => Date;
}

const defaultSettings: DoctorSettings = {
  isAvailable: true,
  minutesPerPatient: 10,
  morningClinic: {
    name: 'Clinic A - Morning Wellness Center',
    address: '123 Health Street, Medical District',
    startTime: '10:00',
    endTime: '13:00',
    bookingOpenTime: '09:00',
  },
  eveningClinic: {
    name: 'Clinic B - Evening Care Center',
    address: '456 Healing Avenue, Wellness Park',
    startTime: '17:00',
    endTime: '20:00',
    bookingOpenTime: '18:00',
  },
  morningBookingsClosed: false,
  eveningBookingsClosed: false,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getStorageKey = () => `homeo-bookings-${getTodayDate()}`;

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<DoctorSettings>(defaultSettings);
  const [currentDate, setCurrentDate] = useState(getTodayDate());

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      const parsed: BookingState = JSON.parse(stored);
      setBookings(parsed.bookings.map(b => ({
        ...b,
        bookingTime: new Date(b.bookingTime),
        estimatedTime: new Date(b.estimatedTime),
      })));
      setSettings(parsed.settings);
    }

    const storedSettings = localStorage.getItem('homeo-settings');
    if (storedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(storedSettings) }));
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    const state: BookingState = {
      bookings,
      settings,
      currentDate,
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
    localStorage.setItem('homeo-settings', JSON.stringify(settings));
  }, [bookings, settings, currentDate]);

  // Reset at midnight
  useEffect(() => {
    const checkDate = () => {
      const today = getTodayDate();
      if (today !== currentDate) {
        setCurrentDate(today);
        setBookings([]);
        setSettings(prev => ({
          ...prev,
          morningBookingsClosed: false,
          eveningBookingsClosed: false,
        }));
      }
    };

    const interval = setInterval(checkDate, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentDate]);

  const hasBookedToday = (mobileNumber: string): boolean => {
    return bookings.some(b => b.mobileNumber === mobileNumber && b.status !== 'consulted');
  };

  const isBookingOpen = (slotType: SlotType): boolean => {
    if (!settings.isAvailable) return false;
    
    if (slotType === 'morning' && settings.morningBookingsClosed) return false;
    if (slotType === 'evening' && settings.eveningBookingsClosed) return false;

    const now = new Date();
    const clinic = slotType === 'morning' ? settings.morningClinic : settings.eveningClinic;
    
    const [openHour, openMin] = clinic.bookingOpenTime.split(':').map(Number);
    const [endHour, endMin] = clinic.endTime.split(':').map(Number);
    
    const openTime = new Date();
    openTime.setHours(openHour, openMin, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0, 0);

    return now >= openTime && now <= endTime;
  };

  const getEstimatedTime = (slotType: SlotType, queueNumber: number): Date => {
    const clinic = slotType === 'morning' ? settings.morningClinic : settings.eveningClinic;
    const [startHour, startMin] = clinic.startTime.split(':').map(Number);
    
    const waitingBefore = bookings.filter(
      b => b.slotType === slotType && b.status === 'waiting' && b.queueNumber < queueNumber
    ).length;

    const estimatedTime = new Date();
    estimatedTime.setHours(startHour, startMin, 0, 0);
    estimatedTime.setMinutes(estimatedTime.getMinutes() + (waitingBefore * settings.minutesPerPatient));
    
    return estimatedTime;
  };

  const getQueueForSlot = (slotType: SlotType): Booking[] => {
    return bookings
      .filter(b => b.slotType === slotType)
      .sort((a, b) => a.queueNumber - b.queueNumber);
  };

  const addBooking = (mobileNumber: string, patientName: string, slotType: SlotType) => {
    if (hasBookedToday(mobileNumber)) {
      return { success: false, error: 'You have already booked a slot today. Please visit at your scheduled time.' };
    }

    if (!isBookingOpen(slotType)) {
      return { success: false, error: 'Booking is not open for this slot yet.' };
    }

    const slotBookings = getQueueForSlot(slotType);
    const queueNumber = slotBookings.length + 1;
    const estimatedTime = getEstimatedTime(slotType, queueNumber);

    const newBooking: Booking = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mobileNumber,
      patientName: patientName || 'Guest Patient',
      slotType,
      queueNumber,
      bookingTime: new Date(),
      status: 'waiting',
      estimatedTime,
    };

    setBookings(prev => [...prev, newBooking]);
    return { success: true, booking: newBooking };
  };

  const markAsConsulted = (bookingId: string) => {
    setBookings(prev => {
      const updated = prev.map(b => 
        b.id === bookingId ? { ...b, status: 'consulted' as const } : b
      );
      
      // Recalculate estimated times for remaining patients
      return updated.map(b => {
        if (b.status === 'waiting') {
          return { ...b, estimatedTime: getEstimatedTime(b.slotType, b.queueNumber) };
        }
        return b;
      });
    });
  };

  const updateSettings = (newSettings: Partial<DoctorSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const closeBookingsForSlot = (slotType: SlotType) => {
    if (slotType === 'morning') {
      setSettings(prev => ({ ...prev, morningBookingsClosed: true }));
    } else {
      setSettings(prev => ({ ...prev, eveningBookingsClosed: true }));
    }
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      settings,
      addBooking,
      markAsConsulted,
      updateSettings,
      closeBookingsForSlot,
      getQueueForSlot,
      hasBookedToday,
      isBookingOpen,
      getEstimatedTime,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
