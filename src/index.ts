import { DocumentStore, GroupBy } from "ravendb";
import { StockCountEvent, Location, Thing } from "./types.js";
import { faker } from "@faker-js/faker";
import * as fs from "fs";
import { sleep } from "./helper.js";
import { getCount } from "./queries.js";

function createStore() {
  // const store = new DocumentStore("http://127.0.0.1:8080", "araneo");
  if (true) {
    //prod
    return new DocumentStore(
      "https://a.prod3-dev.arturtest.ravendb.cloud",
      "araneo",
      {
        certificate: fs.readFileSync("./prod-cert.pfx"),
        type: "pfx", // or "pem"
        password: "238A7B98F15F5CDA44A2C1512FF99BD8",
      }
    );
  } else {
    //free
    return new DocumentStore(
      "https://a.free.arturtest.ravendb.cloud",
      "araneo",
      {
        certificate: fs.readFileSync("./cert.pfx"),
        type: "pfx", // or "pem"
        password: "55E81AFA9BC441B1633FCF8EC2E2F55",
      }
    );
  }
}
function getStore() {
  let store = createStore();
  store.initialize();
  return store;
}

const store = getStore();
const max = 1000;
const stockCountId = "stockCounts/" + new Date().getTime();

async function addAssets(store: DocumentStore) {
  const session = store.openSession();
  const asset = new Thing({
    epc: "things/999",
    ean: "ean/" + faker.datatype.number({ min: 1, max: 10 }),
    attributes: {
      color: faker.color.human(),
      bool: false,
    },
  });
  await session.store(asset);

  for (let i = 0; i < 101; i++) {
    const asset = new Thing({
      epc: "things/" + i,
      ean: "ean/" + faker.datatype.number({ min: 1, max: 10 }),
      attributes: {
        color: faker.color.human(),
        bool: i % 2 === 0,
      },
    });

    await session.store(asset);
  }
  await session.saveChanges();
}

/*
 * Adds 1000 events in batches of 20.
 *   adds exactly 100 events with `uniqueThingId: thing/!`
 */
async function addEvents(store: DocumentStore) {
  const session = store.openSession();
  session.advanced.maxNumberOfRequestsPerSession = 100;

  const start = new Date();

  for (let i = 0; i < max; i++) {
    const event = new StockCountEvent({
      stockCountId: stockCountId,
      sessionId: "sessions/" + (i % 10),
      id: faker.datatype.uuid(),
      locationId: "locations/" + faker.random.numeric(2),
      value: faker.datatype.number({ min: 1, max: 100 }),
      ean: "eans/" + faker.datatype.number({ min: 1, max: 10 }),
      epc: i % 10 == 0 ? "things/999" : "things/" + faker.random.numeric(2),
      timestamp: new Date(),
    });

    await session.store(event);
    // if (i % 100 == 0) await session.saveChanges();
  }
  await session.saveChanges();
  console.log(
    `Insert ${max} items took: ` +
      (new Date().getTime() - start.getTime()) +
      " ms"
  );
  session.dispose();
}

//await addAssets(store);
//throw new Error("exit");
await addEvents(store);
const promises: Promise<unknown>[] = [];
const initialCount = await getCount(store);

for (let i = 0; i < 3000; i++) {
  //   if (i % 100 === 0) console.log("Iteration: " + i);
  await addEvents(store);
  promises.push(getCount(store, initialCount + max * 0.1 * (i + 1)));
  //await sleep(500);
}
await Promise.all(promises);

store.dispose();
