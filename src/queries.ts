import { DocumentStore } from "ravendb";

export async function getCount(store: DocumentStore, expected?: number) {
  const session = store.openSession();
  const now = new Date();
  const data: any[] = await session.advanced
    .rawQuery(
      `
        from "StockCountEvents" e
     group by e.uniqueThingId
     where e.uniqueThingId='thing/!'
     select count() as count, e.uniqueThingId`
    )
    .waitForNonStaleResults()
    .all();

  //   const data = await session
  //     .query<StockCountEvent>({ collection: "StockCountEvents" })
  //     .waitForNonStaleResults()
  //     .whereEquals("uniqueThingId", "thing/!")
  //     .groupBy("uniqueThingId")
  //     .selectKey("uniqueThingId")
  //     .selectCount("count")
  //     .all();
  const currentCount = (data[0] as any)["count"] as number;
  console.log(
    "Count: ",
    data[0].uniqueThingId,
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
