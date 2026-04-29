import { TrackingAdapter } from '../tracking.adapter';

describe('TrackingAdapter', () => {
  let adapter: TrackingAdapter;

  beforeEach(() => {
    // Usar fake timers para poder adelantar el tiempo del setTimeout interno
    jest.useFakeTimers();
    adapter = new TrackingAdapter();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call mockSoapCall on first request (cache miss)', async () => {
    const routeId = 'ruta-123';
    
    // Iniciar la llamada
    const trackingPromise = adapter.getTrackingInfo(routeId);
    
    // Adelantar el timer interno del mockSoapCall (500ms)
    jest.advanceTimersByTime(500);
    
    const result = await trackingPromise;
    
    expect(result).toBeDefined();
    expect(result.routeId).toBe(routeId);
    expect(result.progressPercent).toBeGreaterThanOrEqual(10);
    expect(result.etaMinutes).toBeGreaterThanOrEqual(10);
  });

  it('should return cached data on second immediate request (cache hit)', async () => {
    const routeId = 'ruta-123';
    
    // Primera llamada (Cache miss)
    const trackingPromise1 = adapter.getTrackingInfo(routeId);
    jest.advanceTimersByTime(500);
    const result1 = await trackingPromise1;
    
    // Segunda llamada inmediata (Cache hit)
    // No avanzamos el timer porque el cache responde inmediato
    const result2 = await adapter.getTrackingInfo(routeId);

    // Los resultados deben ser exactamente la misma referencia u objeto
    expect(result2).toEqual(result1);
  });
});
