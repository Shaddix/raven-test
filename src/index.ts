import { DocumentStore, GroupBy } from "ravendb";
import { StockCountEvent, Location } from "./types.js";
import { faker } from "@faker-js/faker";
import * as fs from "fs";
import { sleep } from "./helper.js";

function getStore() {
  // const store = new DocumentStore("http://127.0.0.1:8080", "araneo");
  const store = new DocumentStore(
    "https://a.free.arturtest.ravendb.cloud",
    "araneo",
    {
      certificate: fs.readFileSync("./cert.pfx"),
      type: "pfx", // or "pem"
      password: "55E81AFA9BC441B1633FCF8EC2E2F55",
    }
  );
  store.initialize();

  return store;
}

const store = getStore();
/*
 * Adds 1000 events in batches of 20.
 *   adds exactly 100 events with `uniqueThingId: thing/!`
 */
async function addEvents(store: DocumentStore) {
  const session = store.openSession();
  session.advanced.maxNumberOfRequestsPerSession = 100;

  const start = new Date();
  for (let i = 0; i < 200; i++) {
    const event = new StockCountEvent({
      stockCountId: "stockCount/" + (i % 10),
      id: faker.datatype.uuid(),
      locationId: "location/" + faker.random.numeric(2),
      value: faker.datatype.number({ min: 1, max: 100 }),
      assetId: "assets/1",
      date: new Date(),
      uniqueThingId:
        i % 10 == 0 ? "thing/!" : "thing/" + faker.random.numeric(2),
    });

    await session.store(event);
    // if (i % 100 == 0) await session.saveChanges();
  }
  await session.saveChanges();
  console.log("Elapsed: " + (new Date().getTime() - start.getTime()) + " ms");
  session.dispose();
}

// await addEvents(store);
const promises: Promise<void>[] = [];
for (let i = 0; i < 3; i++) {
  //   if (i % 100 === 0) console.log("Iteration: " + i);
  await addEvents(store);
  //   await sleep(1000);
  promises.push(getCount(store));
}
await Promise.all(promises);

store.dispose();

async function getCount(store: DocumentStore) {
  const session = store.openSession();
  const now = new Date();
  const data: any[] = await session.advanced
    .rawQuery(
      `from "StockCountEvents" e
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
  console.log(
    "Count: ",
    data[0].uniqueThingId,
    "-",
    (data[0] as any)["count"],
    "Elapsed",
    new Date().getTime() - now.getTime(),
    "ms"
  );
}