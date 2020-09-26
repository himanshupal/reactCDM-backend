const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { department: queryDpt }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access, department } = await authenticate(authorization);
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		if (access !== `Director` && queryDpt) throw new ForbiddenError(`Access Denied ⚠`);

		return await client
			.db(dbName)
			.collection(`courses`)
			.aggregate([
				{ $match: { department: queryDpt || department } },
				{
					$addFields: {
						headOfDepartment: { $toObjectId: `$headOfDepartment` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `headOfDepartment`,
						foreignField: `_id`,
						as: `headOfDepartment`,
					},
				},
				{ $unwind: { path: `$headOfDepartment`, preserveNullAndEmptyArrays: true } },
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
			.sort({ identifier: 1 })
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
