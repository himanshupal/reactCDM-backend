const { ForbiddenError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, __, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access } = await authenticate(authorization);
		if (access !== `Director`) throw new ForbiddenError(`Access Denied ⚠`);

		return await client
			.db(dbName)
			.collection(`departments`)
			.aggregate([
				{
					$addFields: {
						director: { $toObjectId: `$director` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `director`,
						foreignField: `_id`,
						as: `director`,
					},
				},
				{ $unwind: { path: `$director`, preserveNullAndEmptyArrays: true } },
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
			.sort({ name: 1 })
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
