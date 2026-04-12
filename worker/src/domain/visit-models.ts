export interface VisitInfo {
  readonly sector: string;
  readonly cell: string;
  readonly date: string;
  readonly entryTime: string;
}

export interface VisitConfig {
  readonly baseUrl: string;
  readonly targetSector: string;
  readonly targetCell: string;
}
