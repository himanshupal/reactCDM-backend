const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { course }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access } = await authenticate(authorization);
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const check = await client
			.db(dbName)
			.collection(`courses`)
			.findOne({ _id: ObjectId(course) });
		if (!check)
			throw new UserInputError(`Not Found ⚠`, {
				error: `Couldn't find the course you've provided details for.`,
			});

		return await client
			.db(dbName)
			.collection(`classes`)
			.aggregate([
				{ $match: { course } },
				{
					$addFields: {
						_id: { $toString: `$_id` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
						classTeacher: { $toObjectId: `$classTeacher` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `classTeacher`,
						foreignField: `_id`,
						as: `classTeacher`,
					},
				},
				{ $unwind: { path: `$classTeacher`, preserveNullAndEmptyArrays: true } },
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
				{
					$lookup: {
						from: `students`,
						localField: `_id`,
						foreignField: `class`,
						as: `totalStudents`,
					},
				},
				{ $addFields: { totalStudents: { $size: `$totalStudents` } } },
			])
			.sort({ name: 1 })
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
