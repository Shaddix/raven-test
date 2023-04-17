export class StockCountEvent {
  public id: string = null!;

  public ean: string | null = null;
  public epc: string | null = null;
  public stockCountId: string = null!;
  public sessionId: string = null!;
  public timestamp: Date = null!;

  public locationId: string = null!;

  public value: number = null!;

  constructor(data: Readonly<StockCountEvent>) {
    Object.assign(this, data);
  }
}

export class Thing {
  public id: string = null!;
  public epc: string = null!;

  public ean: string | null = null;

  public attributes: Record<string, any> = null!;

  constructor(data: Readonly<Omit<Thing, "id">>) {
    Object.assign(this, data);
    this.id = this.epc;
  }
}

// from StockCountEvents e
// where e.stockCountId = '123' && e.sessionId='321'

// from StockCountEvents e
// where e.stockCountId = '123' && e.sessionId='321'
//

// from StockCountEvents e
// group by e.epc
// where e.stockCountId = '123', MIN(e.timestamp)

export class Location {
  public id: string = null!;
  public title: string = "";
  public parentId: string | null = null;

  constructor(data: Readonly<Location>) {
    Object.assign(this, data);
  }
}
