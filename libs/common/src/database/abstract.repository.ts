import { FilterQuery, Model, Types, UpdateQuery } from "mongoose";
import { AbstractDocument } from "./abstract.schema";
import { Logger, NotFoundException } from "@nestjs/common";

// This is a base class that handles common database operations
// Other repository classes can inherit from this to get basic database functionality
export abstract class AbstractRepository <TDocument extends AbstractDocument> {
    // Each child class needs to have its own logger for error tracking
    protected abstract readonly logger: Logger;

    // When creating a new repository, we need to pass in the database model we're working with
    constructor(protected readonly model: Model<TDocument>) {}

    // Creates a new record in the database
    // We generate a unique ID and combine it with the provided data
    async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
        const createDocument = new this.model({
            ...document,
            _id: new Types.ObjectId(),
        });
        return (await createDocument.save()).toJSON() as unknown as TDocument;
    }

    // Finds a single record that matches the search criteria (filterQuery)
    // Throws an error if no record is found
    async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
        const document = await this.model
            .findOne(filterQuery)
            .lean<TDocument>(true);
        
        if (!document) {
            this.logger.warn('Document not found with filterQuery:', filterQuery);
            throw new NotFoundException('Document not found');
        }

        return document;
    }

    // Finds a record and updates it with new data
    // Returns the updated record
    // Throws an error if no record is found
    async findOneAndUpdate(
        filterQuery: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>,
    ): Promise<TDocument> {
        const document = await this.model
            .findOneAndUpdate(filterQuery, update, {
                new: true,
            })
            .lean<TDocument>(true);

        if (!document) {
            this.logger.warn('Document not found with filterQuery:', filterQuery);
            throw new NotFoundException('Document not found');
        }

        return document;
    }

    // Finds all records that match the search criteria
    // Returns an array of matching records
    async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
        return this.model.find(filterQuery).lean<TDocument[]>(true);
    }

    // Finds a single record and deletes it from the database
    // Returns the deleted record
    async findOneAndDelete(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
        return this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
    }
}
