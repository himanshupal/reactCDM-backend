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

		await authenticate(authorization);

		const classes = await client
			.db(`RBMI`)
			.collection(`classes`)
			.aggregate([
				{ $match: { course: ObjectId(course) } },
				{
					$addFields: {
						classTeacher: { $toObjectId: `$classTeacher` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
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
						as: `students`,
					},
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `name`,
						foreignField: `class`,
						as: `subjects`,
					},
				},
			])
			.toArray();

		return classes.map((data) => {
			return { ...data, totalStudents: data.students.length };
		});
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
