export type SlotType = 'morning' | 'evening';

export interface ClinicInfo {
  name: string;
  address: string;
  startTime: string; // e.g., "10:00"
  endTime: string;   // e.g., "13:00"
  bookingOpenTime: string; // e.g., "09:00"
}

export interface Booking {
  id: string;
  mobileNumber: string;
  patientName: string;
  slotType: SlotType;
  queueNumber: number;
  bookingTime: Date;
  status: 'waiting' | 'consulted';
  estimatedTime: Date;
}

export interface DoctorSettings {
  isAvailable: boolean;
  minutesPerPatient: number;
  morningClinic: ClinicInfo;
  eveningClinic: ClinicInfo;
  morningBookingsClosed: boolean;
  eveningBookingsClosed: boolean;
}

export interface BookingState {
  bookings: Booking[];
  settings: DoctorSettings;
  currentDate: string;
}
