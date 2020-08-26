const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

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

		return await client
			.db(`RBMI`)
			.collection(`classes`)
			.aggregate([
				{ $match: { course } },
				{
					$lookup: {
						from: `subjects`,
						localField: `name`,
						foreignField: `class`,
						as: `subjects`,
					},
				},
				{ $unwind: { path: `$subjects`, preserveNullAndEmptyArrays: true } },
				{
					$addFields: {
						"subjects.teacher": { $toObjectId: `$subjects.teacher` },
						"subjects.createdBy": { $toObjectId: `$subjects.createdBy` },
						"subjects.updatedBy": { $toObjectId: `$subjects.updatedBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `subjects.teacher`,
						foreignField: `_id`,
						as: `subjects.teacher`,
					},
				},
				{
					$unwind: {
						path: `$subjects.teacher`,
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `subjects.createdBy`,
						foreignField: `_id`,
						as: `subjects.createdBy`,
					},
				},
				{ $unwind: `$subjects.createdBy` },
				{
					$lookup: {
						from: `teachers`,
						localField: `subjects.updatedBy`,
						foreignField: `_id`,
						as: `subjects.updatedBy`,
					},
				},
				{
					$unwind: {
						path: `$subjects.updatedBy`,
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$group: {
						_id: `$_id`,
						name: { $first: `$name` },
						subjects: { $push: `$subjects` },
						sessionEnd: { $first: `$sessionEnd` },
						classTeacher: { $first: `$classTeacher` },
						sessionStart: { $first: `$sessionStart` },
						createdAt: { $first: `$createdAt` },
						updatedAt: { $first: `$updatedAt` },
						createdBy: { $first: `$createdBy` },
						updatedBy: { $first: `$updatedBy` },
					},
				},
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
				{
					$unwind: {
						path: `$classTeacher`,
						preserveNullAndEmptyArrays: true,
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
				{ $unwind: `$createdBy` },
				{
					$lookup: {
						from: `teachers`,
						localField: `updatedBy`,
						foreignField: `_id`,
						as: `updatedBy`,
					},
				},
				{
					$unwind: {
						path: `$updatedBy`,
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: `students`,
						localField: `_id`,
						foreignField: `class`,
						as: `totalStudents`,
					},
				},
				{
					$addFields: { totalStudents: { $size: `$totalStudents` } },
				},
			])
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
