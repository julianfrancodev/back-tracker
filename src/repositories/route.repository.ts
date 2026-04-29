import { DatabaseSync } from 'node:sqlite';
import { CreateRouteDTO, UpdateRouteDTO, RouteQueryDTO, Route } from '../dtos/route.dto';

export class RouteRepository {
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  findAll(filters: Omit<RouteQueryDTO, 'page' | 'limit'>, pagination: { limit: number; offset: number }): { data: Route[]; total: number } {
    let query = "SELECT * FROM routes WHERE status != 'INHABILITADA'";
    let countQuery = "SELECT COUNT(*) as total FROM routes WHERE status != 'INHABILITADA'";
    const params: Record<string, string | number> = {};

    if (filters.origin_city) {
      query += ' AND origin_city = $origin_city';
      countQuery += ' AND origin_city = $origin_city';
      params['$origin_city'] = filters.origin_city;
    }
    if (filters.destination_city) {
      query += ' AND destination_city = $destination_city';
      countQuery += ' AND destination_city = $destination_city';
      params['$destination_city'] = filters.destination_city;
    }
    if (filters.vehicle_type) {
      query += ' AND vehicle_type = $vehicle_type';
      countQuery += ' AND vehicle_type = $vehicle_type';
      params['$vehicle_type'] = filters.vehicle_type;
    }
    if (filters.status) {
      query += ' AND status = $status';
      countQuery += ' AND status = $status';
      params['$status'] = filters.status;
    }
    if (filters.carrier) {
      query += ' AND carrier = $carrier';
      countQuery += ' AND carrier = $carrier';
      params['$carrier'] = filters.carrier;
    }

    query += ` LIMIT ${Number(pagination.limit)} OFFSET ${Number(pagination.offset)}`;

    const stmt = this.db.prepare(query);
    const countStmt = this.db.prepare(countQuery);

    const data = stmt.all(params) as unknown as Route[];
    const totalRow = countStmt.get(params) as { total: number };

    return {
      data,
      total: totalRow.total
    };
  }

  findById(id: number): Route | undefined {
    const stmt = this.db.prepare("SELECT * FROM routes WHERE id = ? AND status != 'INHABILITADA'");
    return stmt.get(id) as unknown as Route | undefined;
  }

  create(data: CreateRouteDTO): Route {
    const stmt = this.db.prepare(`
      INSERT INTO routes (
        origin_city, destination_city, distance_km, estimated_time_hours, 
        vehicle_type, carrier, cost_usd, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.origin_city, data.destination_city, data.distance_km, data.estimated_time_hours,
      data.vehicle_type, data.carrier, data.cost_usd, data.status, new Date().toISOString()
    );

    return this.findById(result.lastInsertRowid as number) as Route;
  }

  update(id: number, data: UpdateRouteDTO): Route | undefined {
    const keys = Object.keys(data);
    if (keys.length === 0) return this.findById(id);

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = Object.values(data) as (string | number | null)[];

    const stmt = this.db.prepare(`UPDATE routes SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);

    return this.findById(id);
  }

  softDelete(id: number): Route | undefined {
    const stmt = this.db.prepare(`UPDATE routes SET status = 'INHABILITADA' WHERE id = ?`);
    stmt.run(id);
    return this.findById(id);
  }

  getDashboardMetrics(startDate?: string, endDate?: string) {
    let whereClause = "WHERE status != 'INHABILITADA'";
    const params: string[] = [];

    if (startDate && endDate) {
      whereClause += ' AND created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const statusQuery = `SELECT status, COUNT(*) as count FROM routes ${whereClause} GROUP BY status`;
    const statusStmt = this.db.prepare(statusQuery);
    const statusCounts = statusStmt.all(...params);

    const topExpensiveQuery = `SELECT * FROM routes ${whereClause} ORDER BY cost_usd DESC LIMIT 5`;
    const topExpensiveStmt = this.db.prepare(topExpensiveQuery);
    const topExpensive = topExpensiveStmt.all(...params) as unknown as Route[];

    return {
      status_counts: statusCounts,
      top_expensive: topExpensive
    };
  }
}
