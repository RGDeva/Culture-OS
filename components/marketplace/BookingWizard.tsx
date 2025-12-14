'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react'

interface BookingWizardProps {
  provider: any
  onClose: () => void
  onComplete: (booking: any) => void
}

const SERVICE_TYPES = [
  { value: 'PRODUCTION', label: 'Production', icon: '🎹' },
  { value: 'MIXING', label: 'Mixing', icon: '🎚️' },
  { value: 'MASTERING', label: 'Mastering', icon: '🎛️' },
  { value: 'RECORDING', label: 'Recording', icon: '🎤' },
  { value: 'VIDEO_PRODUCTION', label: 'Video Production', icon: '🎥' },
  { value: 'PHOTOGRAPHY', label: 'Photography', icon: '📸' },
  { value: 'SESSION_MUSICIAN', label: 'Session Musician', icon: '🎸' },
  { value: 'STUDIO_RENTAL', label: 'Studio Rental', icon: '🏢' },
  { value: 'SONGWRITING', label: 'Songwriting', icon: '✍️' },
  { value: 'VOCAL_COACHING', label: 'Vocal Coaching', icon: '🎵' },
]

export function BookingWizard({ provider, onClose, onComplete }: BookingWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [serviceType, setServiceType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(2)
  const [rateType, setRateType] = useState<'hourly' | 'day'>('hourly')

  const rate = rateType === 'hourly' ? provider.hourlyRate : provider.dayRate
  const totalPrice = rateType === 'hourly' 
    ? rate * duration 
    : rate * Math.ceil(duration / 8)

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const scheduledTime = new Date(`${date}T${time}`)

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          clientId: 'current_user_id', // TODO: Get from auth
          serviceType,
          title: title || `${serviceType} Service`,
          description,
          location: isRemote ? null : location,
          isRemote,
          scheduledTime: scheduledTime.toISOString(),
          durationHours: duration,
          rate: rateType === 'hourly' ? rate : rate / 8,
          currency: 'USD',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const data = await response.json()
      onComplete(data.booking)
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return serviceType !== ''
      case 2:
        return date !== '' && time !== '' && duration > 0
      case 3:
        return isRemote || location !== ''
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="border-b dark:border-green-400/20 border-green-600/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
              &gt; BOOK_{provider.displayName.toUpperCase().replace(/\s/g, '_')}
            </h2>
            <p className="font-mono dark:text-green-400/60 text-green-700/70 text-sm mt-1">
              Step {step} of 4
            </p>
          </div>
          <button
            onClick={onClose}
            className="dark:text-green-400 text-green-700 hover:opacity-70"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 dark:bg-green-400/10 bg-green-600/10">
          <div
            className="h-full dark:bg-green-400 bg-green-600 transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Service Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-mono dark:text-green-400 text-green-700 text-lg font-bold mb-4">
                SELECT_SERVICE_TYPE:
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_TYPES.filter(s => 
                  provider.servicesOffered?.includes(s.value)
                ).map((service) => (
                  <button
                    key={service.value}
                    onClick={() => setServiceType(service.value)}
                    className={`p-4 border-2 text-left transition-all ${
                      serviceType === service.value
                        ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10'
                        : 'dark:border-green-400/20 border-green-600/20 hover:dark:border-green-400/50 hover:border-green-600/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{service.icon}</div>
                    <div className="font-mono dark:text-green-400 text-green-700 text-sm font-bold">
                      {service.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-mono dark:text-green-400 text-green-700 text-lg font-bold mb-4">
                SCHEDULE_SESSION:
              </h3>
              
              <div>
                <label className="font-mono dark:text-green-400/60 text-green-700/70 text-sm mb-2 block">
                  DATE:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                />
              </div>

              <div>
                <label className="font-mono dark:text-green-400/60 text-green-700/70 text-sm mb-2 block">
                  TIME:
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                />
              </div>

              <div>
                <label className="font-mono dark:text-green-400/60 text-green-700/70 text-sm mb-2 block">
                  DURATION:
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold w-20">
                    {duration} {duration === 1 ? 'hour' : 'hours'}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-mono dark:text-green-400/60 text-green-700/70 text-sm mb-2 block">
                  RATE_TYPE:
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRateType('hourly')}
                    className={`flex-1 p-3 border-2 font-mono ${
                      rateType === 'hourly'
                        ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                        : 'dark:border-green-400/20 border-green-600/20 dark:text-green-400/60 text-green-700/70'
                    }`}
                  >
                    HOURLY (${provider.hourlyRate}/hr)
                  </button>
                  <button
                    onClick={() => setRateType('day')}
                    className={`flex-1 p-3 border-2 font-mono ${
                      rateType === 'day'
                        ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                        : 'dark:border-green-400/20 border-green-600/20 dark:text-green-400/60 text-green-700/70'
                    }`}
                  >
                    DAY (${provider.dayRate}/day)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-mono dark:text-green-400 text-green-700 text-lg font-bold mb-4">
                LOCATION:
              </h3>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsRemote(false)}
                  className={`flex-1 p-4 border-2 font-mono ${
                    !isRemote
                      ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                      : 'dark:border-green-400/20 border-green-600/20 dark:text-green-400/60 text-green-700/70'
                  }`}
                >
                  <MapPin className="h-6 w-6 mx-auto mb-2" />
                  IN_PERSON
                </button>
                <button
                  onClick={() => setIsRemote(true)}
                  className={`flex-1 p-4 border-2 font-mono ${
                    isRemote
                      ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                      : 'dark:border-green-400/20 border-green-600/20 dark:text-green-400/60 text-green-700/70'
                  }`}
                >
                  <Clock className="h-6 w-6 mx-auto mb-2" />
                  REMOTE
                </button>
              </div>

              {!isRemote && (
                <div>
                  <label className="font-mono dark:text-green-400/60 text-green-700/70 text-sm mb-2 block">
                    ADDRESS:
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location..."
                    className="w-full p-3 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                  />
                </div>
              )}

              <div>
                <label className="font-mono dark:text-green-400/60 text-green-700/70 text-sm mb-2 block">
                  ADDITIONAL_DETAILS (optional):
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any specific requirements or notes..."
                  rows={4}
                  className="w-full p-3 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono focus:outline-none focus:dark:border-green-400 focus:border-green-600 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="font-mono dark:text-green-400 text-green-700 text-lg font-bold mb-4">
                REVIEW_BOOKING:
              </h3>

              <div className="border dark:border-green-400/20 border-green-600/20 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    SERVICE:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {SERVICE_TYPES.find(s => s.value === serviceType)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    PROVIDER:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {provider.displayName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    DATE & TIME:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {new Date(`${date}T${time}`).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    DURATION:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {duration} {duration === 1 ? 'hour' : 'hours'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    LOCATION:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {isRemote ? 'REMOTE' : location}
                  </span>
                </div>
                <div className="border-t dark:border-green-400/20 border-green-600/20 pt-3 mt-3 flex justify-between">
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    TOTAL:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold text-xl">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border dark:border-yellow-400/20 border-yellow-600/20 dark:bg-yellow-400/5 bg-yellow-600/5 p-4">
                <p className="font-mono dark:text-yellow-400/80 text-yellow-700/80 text-sm">
                  ⚠️ Payment will be processed after the provider confirms the booking.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t dark:border-green-400/20 border-green-600/20 p-6 flex justify-between">
          <Button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            variant="outline"
            className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
            >
              NEXT
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  BOOKING...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  CONFIRM_BOOKING
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
