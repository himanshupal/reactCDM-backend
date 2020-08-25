const { ForbiddenError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { department }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access, department: userDepartment } = await authenticate(
			authorization
		);
		if (access === `Student` || (department && access !== `Director`))
			throw new ForbiddenError(`Access Denied ⚠`);

		return await client
			.db(`RBMI`)
			.collection(`teachers`)
			.aggregate([
				{ $match: { department: department || userDepartment } },
				{
					$addFields: {
						_id: { $toString: `$_id` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `classes`,
						localField: `_id`,
						foreignField: `classTeacher`,
						as: `classTeacherOf`,
					},
				},
				{
					$unwind: {
						path: `$classTeacherOf`,
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `_id`,
						foreignField: `teacher`,
						as: `teaches`,
					},
				},
			])
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
