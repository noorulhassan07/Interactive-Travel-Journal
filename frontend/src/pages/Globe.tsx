import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GlobeGL from 'globe.gl';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Info, X } from 'lucide-react';
import api from '../services/api';

interface Trip {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface Location {
  id: number;
  tripId: number;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface CountryInfo {
  name: string;
  capital: string;
  population: string;
  language: string;
}

export default function Globe() {
  const globeRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchTripsAndLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const tripsRes = await api.get<Trip[]>(`/trips?email=${currentUser.email}`, { headers: { Authorization: `Bearer ${token}` } });

        const allLocations: Location[] = [];
        for (const trip of tripsRes.data) {
          const locRes = await api.get<Location[]>(`/trips/${trip.id}/locations`, { headers: { Authorization: `Bearer ${token}` } });
          allLocations.push(...locRes.data);
        }

        setLocations(allLocations);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTripsAndLocations();
  }, [currentUser]);

  useEffect(() => {
    if (!globeRef.current || locations.length === 0) return;

    const pointsData = locations.map(loc => ({
      lat: loc.lat,
      lng: loc.lng,
      size: 0.5,
      color: '#f77f00',
      label: `${loc.city}, ${loc.country}`,
      country: loc.country,
    }));

    const arcsData: any[] = [];
    for (let i = 0; i < pointsData.length - 1; i++) {
      arcsData.push({
        startLat: pointsData[i].lat,
        startLng: pointsData[i].lng,
        endLat: pointsData[i + 1].lat,
        endLng: pointsData[i + 1].lng,
      });
    }

    const globe = new GlobeGL(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .pointsData(pointsData)
      .pointAltitude(0.01)
      .pointColor('color')
      .pointRadius('size')
      .pointLabel('label')
      .arcsData(arcsData)
      .arcColor(() => '#90be6d')
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(2000)
      .arcStroke(0.5)
      .onPointClick((point: any) => {
        setSelectedCountry({
          name: point.country,
          capital: 'N/A',
          population: 'N/A',
          language: 'N/A',
        });
      });

    const resizeGlobe = () => {
      globe.width(globeRef.current?.offsetWidth || 0 ).height(globeRef.current?.offsetHeight || 0 );
    };
    resizeGlobe();
    window.addEventListener('resize', resizeGlobe);

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;

    return () => {
      window.removeEventListener('resize', resizeGlobe);
      if (globeRef.current) globeRef.current.innerHTML = '';
    };
  }, [locations]);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-[#1d3557] mb-2">Interactive Globe</h1>
        <p className="text-gray-600">Explore your travel journey across the world</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden relative" style={{ height: '600px' }}>
        <div ref={globeRef} className="w-full h-full"></div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-[#0077b6]" />
            <span className="font-semibold text-[#1d3557]">Legend</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f77f00]"></div>
              <span className="text-gray-700">Visited Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-[#90be6d]"></div>
              <span className="text-gray-700">Travel Route</span>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <Info className="w-5 h-5 text-[#0077b6]" />
        </div>
      </motion.div>

      {selectedCountry && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 z-50">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-[#1d3557]">{selectedCountry.name}</h3>
            <button onClick={() => setSelectedCountry(null)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Capital:</span>
              <span className="font-medium text-[#1d3557]">{selectedCountry.capital}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Population:</span>
              <span className="font-medium text-[#1d3557]">{selectedCountry.population}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Language:</span>
              <span className="font-medium text-[#1d3557]">{selectedCountry.language}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Click markers to see country information</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
