import {
  type AnyBulkWriteOperation,
  type Db,
  type Collection,
  MongoClient,
  ObjectId,
} from "mongodb";
import type {
  LinkDocument,
  LinkRepository,
  UpdateByIdOperation,
  WithId,
} from "./domain.js";

export class MongoDb {
  private readonly client: MongoClient;
  readonly db: Db;

  private constructor(url: string) {
    this.client = new MongoClient(url);
    this.db = this.client.db();
  }

  static async create(url: string): Promise<MongoDb> {
    const mongoDb = new MongoDb(url);
    await mongoDb.connect();
    return mongoDb;
  }

  async connect(): Promise<void> {
    console.log("Connecting to MongoDb...");
    await this.client.connect();
    console.log("Connected to MongoDb");
  }

  async close(): Promise<void> {
    await this.client.close();
    console.log("MongoDb connection closed");
  }
}

export class MongoLinkRepository implements LinkRepository {
  private readonly collection: Collection<LinkDocument>;

  private constructor(mongoDb: MongoDb) {
    this.collection = mongoDb.db.collection("links");
  }

  static async create(mongoDb: MongoDb): Promise<MongoLinkRepository> {
    const linkRepository = new MongoLinkRepository(mongoDb);
    await linkRepository.collection.createIndex(
      {
        type: 1,
        link: 1,
      },
      { unique: true },
    );
    return linkRepository;
  }

  async insertLinksIfNotExists(documents: LinkDocument[]): Promise<void> {
    await this.collection.bulkWrite(
      documents.map((document) => {
        return {
          updateOne: {
            filter: {
              link: document.link,
              type: document.type,
            },
            update: {
              $setOnInsert: document,
            },
            upsert: true,
          },
        };
      }),
    );
  }

  async findNonVisitedLinks(
    type: LinkDocument["type"],
  ): Promise<WithId<LinkDocument>[]> {
    return this.collection
      .find({
        type,
        visitedAt: null,
      })
      .project<WithId<LinkDocument>>({
        _id: 0,
        id: {
          $toString: "$_id",
        },
        link: 1,
        type: 1,
        data: 1,
        visitedAt: 1,
      })
      .toArray();
  }

  async updateLinkById({ id, document }: UpdateByIdOperation): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: document,
      },
    );
  }

  async insertAndUpdateLinks(
    inserts: LinkDocument[],
    updates: UpdateByIdOperation[],
  ): Promise<void> {
    const operations: AnyBulkWriteOperation<LinkDocument>[] = [];
    for (const document of inserts) {
      operations.push({
        insertOne: {
          document,
        },
      });
    }
    for (const { id, document } of updates) {
      operations.push({
        updateOne: {
          filter: {
            _id: new ObjectId(id),
          },
          update: {
            $set: document,
          },
        },
      });
    }
    await this.collection.bulkWrite(operations);
  }
}
