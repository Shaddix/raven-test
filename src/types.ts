export class StockCountEvent {
  public id: string = null!;
  public stockCountId: string = null!;
  public locationId: string = null!;
  public assetId: string | null = null;
  public uniqueThingId: string | null = null;
  public value: number = null!;

  public date: Date = null!;

  constructor(data: Readonly<StockCountEvent>) {
    Object.assign(this, data);
  }
}

export class Location {
  public id: string = null!;
  public title: string = "";
  public parentId: string | null = null;

  constructor(data: Readonly<Location>) {
    Object.assign(this, data);
  }
}
