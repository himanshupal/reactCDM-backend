const { ForbiddenError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { page }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access, class: userClass } = await authenticate(authorization);
		if (access !== `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		await client
			.db(dbName)
			.collection(`notes`)
			.aggregate([
				{ $addFields: { createdBy: { $toObjectId: `$createdBy` } } },
				{
					$lookup: {
						from: `students`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
				{
					$match: {
						$or: [
							{ scope: `Class`, class: userClass },
							{ scope: `Private`, createdBy: loggedInUser },
							{ scope: `Friends`, "createdBy.friends": loggedInUser },
						],
					},
				},
			])
			.skip(5 * (page - 1))
			.limit(5)
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
