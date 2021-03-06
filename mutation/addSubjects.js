const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

const permitted = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { class: className, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`subjects`);

		const check = await client.db(dbName).collection(`classes`).findOne({ name: className });
		if (!check)
			throw new UserInputError(`Class not found ⚠`, {
				error: `Couldn't find any class with provided details.`,
			});

		const savedSubjects = await Promise.all(
			data.map(async (current) => {
				try {
					if (current.subjectCode !== undefined && current.name !== undefined) {
						const check = await node.findOne({
							subjectCode: current.subjectCode,
						});
						if (check)
							throw new UserInputError(`Already exists ⚠`, {
								error: `Subject ${check.name} with code ${current.subjectCode} already exists.`,
							});

						const { insertedId } = await node.insertOne({
							...current,
							class: className,
							language: current.language || `English`,
							createdAt: Timestamp.fromNumber(Date.now()),
							createdBy: loggedInUser,
						});

						const [subject] = await node
							.aggregate([
								{ $match: { _id: insertedId } },
								{
									$addFields: {
										teacher: { $toObjectId: `$teacher` },
										createdBy: { $toObjectId: `$createdBy` },
									},
								},
								{
									$lookup: {
										from: `teachers`,
										localField: `teacher`,
										foreignField: `_id`,
										as: `teacher`,
									},
								},
								{ $unwind: { path: `$teacher`, preserveNullAndEmptyArrays: true } },
								{
									$lookup: {
										from: `teachers`,
										localField: `createdBy`,
										foreignField: `_id`,
										as: `createdBy`,
									},
								},
								{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
							])
							.toArray();

						return subject;
					}
				} catch (error) {
					throw error;
				}
			})
		);

		return savedSubjects.filter((x) => x);
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
