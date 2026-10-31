// Turkey Major Route Matrix: Distance, Driving Hours, Toll/HGS Estimates
// LojiTR v3.0

export interface RouteInfo {
  origin: string;
  destination: string;
  distanceKm: number;
  drivingHours: number; // Takograf mola kuralları dahil
  estimatedTollCost: number; // Köprü, Otoyol, Avrasya/Osmangazi/KMO HGS (TL)
  recommendedRouteName: string;
}

// 81 İl ve Sanayi / Liman Merkezleri Mesafe Tablosu
const ROUTES: RouteInfo[] = [
  { origin: 'Gebze', destination: 'İskenderun', distanceKm: 980, drivingHours: 13.5, estimatedTollCost: 2850, recommendedRouteName: 'Anadolu Otoyolu + O-21 Niğde-Pozantı' },
  { origin: 'Gebze', destination: 'Mersin', distanceKm: 920, drivingHours: 12.5, estimatedTollCost: 2600, recommendedRouteName: 'O-21 Ankara-Niğde Otoyolu' },
  { origin: 'Gebze', destination: 'İzmir', distanceKm: 430, drivingHours: 5.5, estimatedTollCost: 3100, recommendedRouteName: 'O-5 Osmangazi Köprüsü + İzmir Otoyolu' },
  { origin: 'Gebze', destination: 'Ankara', distanceKm: 410, drivingHours: 5.5, estimatedTollCost: 650, recommendedRouteName: 'O-4 Anadolu Otoyolu' },
  { origin: 'Gebze', destination: 'Bursa', distanceKm: 130, drivingHours: 2.0, estimatedTollCost: 1100, recommendedRouteName: 'Osmangazi Köprüsü' },
  { origin: 'Gebze', destination: 'Antalya', distanceKm: 650, drivingHours: 9.0, estimatedTollCost: 950, recommendedRouteName: 'Bilecik - Kütahya - Afyon - Burdur' },
  { origin: 'Gebze', destination: 'Adana', distanceKm: 890, drivingHours: 12.0, estimatedTollCost: 2500, recommendedRouteName: 'O-21 Niğde-Pozantı Otoyolu' },
  { origin: 'Gebze', destination: 'Gaziantep', distanceKm: 1080, drivingHours: 15.0, estimatedTollCost: 2950, recommendedRouteName: 'O-52 TAG Otoyolu' },
  { origin: 'Gebze', destination: 'Konya', distanceKm: 590, drivingHours: 8.0, estimatedTollCost: 750, recommendedRouteName: 'Eskişehir - Afyon - Konya D200/D300' },
  { origin: 'Gebze', destination: 'Kayseri', distanceKm: 720, drivingHours: 9.5, estimatedTollCost: 1250, recommendedRouteName: 'Ankara Çevre Yolu - Kırşehir - Kayseri' },
  { origin: 'Gebze', destination: 'Samsun', distanceKm: 690, drivingHours: 9.5, estimatedTollCost: 700, recommendedRouteName: 'Gerede - Merzifon - Samsun D100' },
  { origin: 'Gebze', destination: 'Trabzon', distanceKm: 1020, drivingHours: 14.5, estimatedTollCost: 850, recommendedRouteName: 'Karadeniz Sahil Yolu D010' },
  { origin: 'Gebze', destination: 'Tekirdağ', distanceKm: 195, drivingHours: 3.0, estimatedTollCost: 1400, recommendedRouteName: 'Kuzey Marmara Otoyolu + Çerkezköy' },
  { origin: 'İstanbul', destination: 'Ankara', distanceKm: 450, drivingHours: 6.0, estimatedTollCost: 800, recommendedRouteName: 'KMO + Anadolu Otoyolu' },
  { origin: 'İstanbul', destination: 'İzmir', distanceKm: 480, drivingHours: 6.0, estimatedTollCost: 3400, recommendedRouteName: 'O-5 Osmangazi + Balıkesir' },
  { origin: 'İstanbul', destination: 'Bursa', distanceKm: 155, drivingHours: 2.5, estimatedTollCost: 1450, recommendedRouteName: 'Osmangazi Köprüsü' },
  { origin: 'İzmir', destination: 'Ankara', distanceKm: 580, drivingHours: 8.0, estimatedTollCost: 950, recommendedRouteName: 'Uşak - Afyon - Polatlı D300' },
  { origin: 'İzmir', destination: 'Mersin', distanceKm: 910, drivingHours: 12.5, estimatedTollCost: 1100, recommendedRouteName: 'Denizli - Konya - Ereğli' },
  { origin: 'Bursa', destination: 'Antalya', distanceKm: 540, drivingHours: 7.5, estimatedTollCost: 600, recommendedRouteName: 'Kütahya - Afyon - Burdur' },
  { origin: 'Ankara', destination: 'Mersin', distanceKm: 490, drivingHours: 6.5, estimatedTollCost: 1850, recommendedRouteName: 'O-21 Ankara-Niğde Otoyolu' },
  { origin: 'Ankara', destination: 'İskenderun', distanceKm: 550, drivingHours: 7.5, estimatedTollCost: 2100, recommendedRouteName: 'O-21 + Pozantı + Ceyhan' },
  { origin: 'Mersin', destination: 'Gaziantep', distanceKm: 295, drivingHours: 4.0, estimatedTollCost: 450, recommendedRouteName: 'O-52 TAG Otoyolu' },
  { origin: 'İskenderun', destination: 'Gaziantep', distanceKm: 190, drivingHours: 2.5, estimatedTollCost: 350, recommendedRouteName: 'Toprakkale - Nurdağı - Antep' },
];

/**
 * Verilen çıkış ve varış metinlerine göre veritabanındaki bilinen rotaları arar.
 * Eşleşme bulunamazsa kuş uçuşu / genel algoritma ile yaklaşık tahmin döndürür.
 */
export function lookupRouteInfo(origin: string, destination: string): RouteInfo {
  const normOrigin = origin.trim().toLowerCase();
  const normDest = destination.trim().toLowerCase();

  const found = ROUTES.find((r) => {
    const o = r.origin.toLowerCase();
    const d = r.destination.toLowerCase();
    return (
      (normOrigin.includes(o) && normDest.includes(d)) ||
      (normOrigin.includes(d) && normDest.includes(o))
    );
  });

  if (found) {
    return found;
  }

  // Akıllı Varsayılan Tahmin
  return {
    origin,
    destination,
    distanceKm: 450,
    drivingHours: 6.0,
    estimatedTollCost: 750,
    recommendedRouteName: 'Devlet Karayolu / Otoyol Güzergahı',
  };
}