const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`),
	authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`];

module.exports = async (_, { id }, { headers }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = CheckAuth(headers.authorization);
		if (user.access === `student`) throw new ForbiddenError(`Access Denied !`);
		if (!accessAllowed.includes(user.access) && id) {
			const specificTeacher = await client
				.db(`RBMI`)
				.collection(`teachers`)
				.aggregate([
					{
						$match: {
							_id: ObjectId(id),
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
				])
				.toArray();
			return specificTeacher.map((teacher) => {
				return {
					...teacher,
					classTeacherOf:
						teacher.classTeacherOf.length > 0
							? teacher.classTeacherOf[0]
							: null,
				};
			});
		}
		const singleTeacher = await client
			.db(`RBMI`)
			.collection(`teachers`)
			.aggregate([
				{
					$match: {
						username: user.username,
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
			])
			.toArray();
		return singleTeacher.map((teacher) => {
			return {
				...teacher,
				classTeacherOf:
					teacher.classTeacherOf.length > 0 ? teacher.classTeacherOf[0] : null,
			};
		});
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
