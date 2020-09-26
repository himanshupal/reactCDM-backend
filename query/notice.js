const { UserInputError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const { dbName } = require(`../config`);

module.exports = async (_, { _id }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const node = client.db(dbName).collection(`notices`);

		const [notice] = await node
			.aggregate([
				{ $match: { _id: ObjectId(_id) } },
				{
					$addFields: {
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: `teachers`,
						localField: `updatedBy`,
						foreignField: `_id`,
						as: `updatedBy`,
					},
				},
				{ $unwind: { path: `$updatedBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		if (!notice)
			throw new UserInputError(`Not Found ⚠`, {
				error: `Couldn't find the notice you've provided details for.`,
			});

		return notice;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
