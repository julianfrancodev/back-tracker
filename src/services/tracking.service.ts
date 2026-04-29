import { TrackingAdapter, TrackingResponse } from '../utils/adapters/tracking.adapter';

export class TrackingService {
  private adapter: TrackingAdapter;

  constructor() {
    this.adapter = new TrackingAdapter();
  }

  public async getRouteTracking(routeId: string): Promise<TrackingResponse> {
    return this.adapter.getTrackingInfo(routeId);
  }
}
