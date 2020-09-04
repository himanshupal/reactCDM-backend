const { ForbiddenError, UserInputError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { class: className }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access } = await authenticate(authorization);
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const check = await client.db(dbName).collection(`classes`).findOne({ name: className });
		if (!check)
			throw new UserInputError(`Class Not Found ⚠`, {
				error: `No Class was found with provided details.`,
			});

		return client
			.db(dbName)
			.collection(`subjects`)
			.aggregate([
				{ $match: { class: className } },
				{
					$addFields: {
						teacher: { $toObjectId: `$teacher` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
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
	} catch (error) {
		return error;
	} finally {
		client.close();
	}
};
