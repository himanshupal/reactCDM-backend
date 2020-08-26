const { MongoClient, ObjectId } = require(`mongodb`);

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

		const check = await client
			.db(`RBMI`)
			.collection(`courses`)
			.findOne({ _id: ObjectId(course) });
		if (!check)
			throw new UserInputError(`Not Found ⚠`, {
				error: `Couldn't find the course you've provided details for.`,
			});

		const res = await client
			.db(`RBMI`)
			.collection(`classes`)
			.aggregate([
				{ $match: { course } },
				{
					$lookup: {
						from: `subjects`,
						let: { name: `$name` },
						pipeline: [
							{ $match: { $expr: { $eq: [`$class`, `$$name`] } } },
							{
								$lookup: {
									from: `teachers`,
									let: { teacher: { $toObjectId: `$teacher` } },
									pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$$teacher`] } } }],
									as: `teacher`,
								},
							},
							{ $unwind: { path: `$teacher`, preserveNullAndEmptyArrays: true } },
							{
								$lookup: {
									from: `teachers`,
									let: { createdBy: { $toObjectId: `$createdBy` } },
									pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$$createdBy`] } } }],
									as: `createdBy`,
								},
							},
							{ $unwind: `$createdBy` },
							{
								$lookup: {
									from: `teachers`,
									let: { updatedBy: { $toObjectId: `$updatedBy` } },
									pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$$updatedBy`] } } }],
									as: `updatedBy`,
								},
							},
							{ $unwind: { path: `$updatedBy`, preserveNullAndEmptyArrays: true } },
						],
						as: `subjects`,
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
				{ $unwind: { path: `$classTeacher`, preserveNullAndEmptyArrays: true } },
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
			.toArray();

		console.log(res);

		return res;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
