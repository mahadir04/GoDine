import React, { useState } from 'react';
import useStore from '../../store/store';
import { X, Calendar, Clock, Users, CheckCircle2 } from 'lucide-react';

const ReservationModal = () => {
  const {
    isReservationModalOpen,
    setIsReservationModalOpen,
    reservationVenue,
    addReservation
  } = useStore();

  const [date, setDate] = useState('2026-09-12');
  const [time, setTime] = useState('7:30 PM');
  const [guests, setGuests] = useState('2 Guests');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isReservationModalOpen) return null;

  const handleClose = () => {
    setIsReservationModalOpen(false);
    setIsSuccess(false);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    addReservation({
      id: `r_${Date.now()}`,
      venueName: reservationVenue?.name || 'The Copper Fork',
      status: 'CONFIRMED',
      time: `${date} · ${time}`,
      guests
    });
    setIsSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full p-6 animate-modal border border-zinc-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
          <div>
            <h3 className="font-bold text-base text-zinc-900">
              {reservationVenue?.category === 'Hotel' || reservationVenue?.category === 'Motel' ? 'Book Room' : 'Reserve Table'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium">{reservationVenue?.name || 'The Copper Fork'}</p>
          </div>
          <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-zinc-900">Reservation Confirmed!</h4>
            <p className="text-xs text-zinc-500">We've added this to your reservations tab.</p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">
                  Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none bg-white font-medium"
                  >
                    <option>5:30 PM</option>
                    <option>6:30 PM</option>
                    <option>7:30 PM</option>
                    <option>8:30 PM</option>
                    <option>9:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">
                  Party / Guests
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none bg-white font-medium"
                  >
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3-4 Guests</option>
                    <option>5+ Guests (Party)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                placeholder="Window seat, outdoor patio, anniversary..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none resize-none font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF5A5F] hover:bg-[#E0484D] text-white font-bold py-3 rounded-xl shadow-md transition-all hover:scale-[1.01] cursor-pointer mt-2"
            >
              Confirm Reservation
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReservationModal;
