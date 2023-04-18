import { DocumentStore, QueryStatistics } from "ravendb";

export async function getCount(store: DocumentStore, expected?: number) {
  const session = store.openSession();
  const now = new Date();
  const thingId = "things/999";
  let stat: QueryStatistics = null!;
  const data = await session.advanced
    .rawQuery(
      `
        from index "StockCountEventWithAsset" e
     where e.epc='${thingId}'
     `
    )
    .statistics((s) => (stat = s))
    .take(1)
    // .waitForNonStaleResults()
    .all();
  const currentCount = stat.totalResults;
  // const currentCount = (data[0] as any)["count"] as number;
  console.log(
    "Count: ",
    thingId,
    "-",
    currentCount,
    expected ? (expected > currentCount ? "!!" : "OK") : "",
    expected ? `(${expected})` : "",
    "Indexing took",
    new Date().getTime() - now.getTime(),
    "ms"
  );

  return currentCount;
}
