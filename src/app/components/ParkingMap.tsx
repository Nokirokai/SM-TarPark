import { useState } from 'react';
import { ParkingSlot } from '../data/mockData';
import { Car, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface ParkingMapProps {
  slots: ParkingSlot[];
  onSlotClick?: (slot: ParkingSlot) => void;
  highlightedSlots?: string[];
  interactive?: boolean;
}

export function ParkingMap({ slots, onSlotClick, highlightedSlots = [], interactive = true }: ParkingMapProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const zones = ['A', 'B', 'C', 'D', 'E', 'F'];
  const filteredSlots = selectedZone === 'all' 
    ? slots 
    : slots.filter(slot => slot.zone === selectedZone);

  const groupedByZone = zones.reduce((acc, zone) => {
    acc[zone] = filteredSlots.filter(slot => slot.zone === zone);
    return acc;
  }, {} as Record<string, ParkingSlot[]>);

  const getSlotColor = (slot: ParkingSlot) => {
    if (highlightedSlots.includes(slot.id)) {
      return 'bg-primary border-primary shadow-lg';
    }
    switch (slot.status) {
      case 'free':
        return 'bg-green-500 border-green-600 hover:bg-green-600';
      case 'occupied':
        return 'bg-red-500 border-red-600 hover:bg-red-600';
      case 'pending':
        return 'bg-yellow-500 border-yellow-600 hover:bg-yellow-600';
      case 'reserved':
        return 'bg-purple-500 border-purple-600 hover:bg-purple-600';
      default:
        return 'bg-muted border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      free: 'Available',
      occupied: 'Occupied',
      pending: 'Pending',
      reserved: 'Reserved'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-4">
      {/* Zone filter and legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-secondary rounded-lg border border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Zone:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-1 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="all">All Zones</option>
            {zones.map(zone => (
              <option key={zone} value={zone}>Zone {zone}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs text-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded border border-green-600" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded border border-red-600" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded border border-yellow-600" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded border border-purple-600" />
            <span>Reserved</span>
          </div>
        </div>
      </div>

      {/* Parking grid */}
      <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
        {selectedZone === 'all' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {zones.map(zone => (
              <div key={zone} className="space-y-2">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 sticky top-0 bg-card py-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm font-black">
                    {zone}
                  </div>
                  <span>Zone {zone}</span>
                  <span className="text-sm font-normal text-muted-foreground ml-auto">
                    ({groupedByZone[zone]?.filter(s => s.status === 'free').length || 0}/{groupedByZone[zone]?.length || 0} free)
                  </span>
                </h3>
                <div className="grid grid-cols-10 gap-1">
                  {groupedByZone[zone]?.slice(0, 100).map(slot => (
                    <SlotButton
                      key={slot.id}
                      slot={slot}
                      color={getSlotColor(slot)}
                      isHovered={hoveredSlot === slot.id}
                      onHover={setHoveredSlot}
                      onClick={onSlotClick}
                      interactive={interactive}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-black">
                {selectedZone}
              </div>
              <span>Zone {selectedZone}</span>
              <span className="text-base font-normal text-muted-foreground ml-auto">
                {groupedByZone[selectedZone]?.filter(s => s.status === 'free').length || 0} / {groupedByZone[selectedZone]?.length || 0} Available
              </span>
            </h3>
            <div className="grid grid-cols-10 gap-2">
              {groupedByZone[selectedZone]?.map(slot => (
                <SlotButton
                  key={slot.id}
                  slot={slot}
                  color={getSlotColor(slot)}
                  isHovered={hoveredSlot === slot.id}
                  onHover={setHoveredSlot}
                  onClick={onSlotClick}
                  interactive={interactive}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slot details on hover */}
      {hoveredSlot && interactive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl p-4 shadow-2xl z-50 max-w-sm"
        >
          {(() => {
            const slot = slots.find(s => s.id === hoveredSlot);
            if (!slot) return null;
            
            return (
              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Slot {slot.id}</p>
                  <p className="text-sm text-muted-foreground">Status: {getStatusLabel(slot.status)}</p>
                  {slot.plate && <p className="text-sm text-muted-foreground">Plate: {slot.plate}</p>}
                  {slot.entryTime && (
                    <p className="text-sm text-muted-foreground">
                      Entry: {new Date(slot.entryTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

interface SlotButtonProps {
  slot: ParkingSlot;
  color: string;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick?: (slot: ParkingSlot) => void;
  interactive: boolean;
}

function SlotButton({ slot, color, isHovered, onHover, onClick, interactive }: SlotButtonProps) {
  return (
    <button
      onMouseEnter={() => interactive && onHover(slot.id)}
      onMouseLeave={() => interactive && onHover(null)}
      onClick={() => interactive && onClick?.(slot)}
      disabled={!interactive}
      className={`
        relative aspect-square rounded border-2 transition-all duration-200 text-white text-xs font-semibold
        ${color}
        ${isHovered ? 'ring-2 ring-primary z-10' : ''}
        ${interactive ? 'cursor-pointer' : 'cursor-default'}
        ${!interactive ? 'opacity-80' : ''}
      `}
      title={`Slot ${slot.id} - ${slot.status}`}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        {slot.id.slice(-2)}
      </span>
    </button>
  );
}
