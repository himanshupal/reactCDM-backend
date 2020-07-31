const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`];

module.exports = async (_, { tid }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`teachers`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (tid)
			return await node
				.aggregate([
					{
						$match: {
							_id: ObjectId(tid),
						},
					},
					{
						$lookup: {
							from: `classes`,
							localField: `username`,
							foreignField: `classTeacher`,
							as: `classTeacherOf`,
						},
					},
					{
						$lookup: {
							from: `subjects`,
							localField: `username`,
							foreignField: `teacher`,
							as: `teaches`,
						},
					},
					{
						$unwind: `$classTeacherOf`,
					},
				])
				.toArray();
		return await node
			.aggregate([
				{
					$lookup: {
						from: `classes`,
						localField: `username`,
						foreignField: `classTeacher`,
						as: `classTeacherOf`,
					},
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `username`,
						foreignField: `teacher`,
						as: `teaches`,
					},
				},
				{
					$unwind: `$classTeacherOf`,
				},
			])
			.toArray();
		// return singleTeacher.map((teacher) => {
		// 	return {
		// 		...teacher,
		// 		classTeacherOf: teacher.classTeacherOf.length > 0 ? teacher.classTeacherOf[0] : null,
		// 	};
		// });
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
