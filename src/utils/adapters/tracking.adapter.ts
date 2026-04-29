import NodeCache from 'node-cache';

export interface TrackingResponse {
  routeId: string;
  lastLocation: string;
  progressPercent: number;
  etaMinutes: number;
  timestamp: string;
}

export class TrackingAdapter {
  private cache: NodeCache;

  constructor() {
    // stdTTL: time to live in seconds
    this.cache = new NodeCache({ stdTTL: 60 });
  }

  private mockSoapCall(routeId: string): Promise<TrackingResponse> {
    return new Promise((resolve) => {
      // Simulamos latencia de red de 500ms
      setTimeout(() => {
        const locations = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Tunja', 'Bucaramanga', 'Cucuta', 'Ibagué', 'Neiva', 'Popayán', 'Quibdó', 'Sincelejo', 'Valledupar', 'Pasto', 'Armenia'];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const progress = Math.floor(Math.random() * 81) + 10; // entre 10 y 90
        const eta = Math.floor(Math.random() * 120) + 10; // entre 10 y 130 min

        resolve({
          routeId,
          lastLocation: randomLocation,
          progressPercent: progress,
          etaMinutes: eta,
          timestamp: new Date().toISOString()
        });
      }, 500);
    });
  }

  public async getTrackingInfo(routeId: string): Promise<TrackingResponse> {
    const cachedData = this.cache.get<TrackingResponse>(routeId);

    if (cachedData) {
      console.log(`[TrackingAdapter] Cache hit para la ruta: ${routeId}`);
      return cachedData;
    }

    console.log(`[TrackingAdapter] Cache miss para la ruta: ${routeId}. Llamando al servicio SOAP...`);
    const freshData = await this.mockSoapCall(routeId);

    // Guardar en caché
    this.cache.set(routeId, freshData);

    return freshData;
  }
}
