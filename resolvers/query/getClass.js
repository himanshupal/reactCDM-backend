const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`),
	authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`];

module.exports = async (_, { id, department }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		user = authenticate(authorization);
		if (user.access === `student`) {
			const student = await client.db(`RBMI`).collection(`students`).findOne({
				username: user.username,
			});
			return await client
				.db(`RBMI`)
				.collection(`classes`)
				.aggregate([
					{
						$match: {
							_id: ObjectId(student.class),
						},
					},
					{
						$lookup: {
							from: `subjects`,
							localField: `alias`,
							foreignField: `classRef`,
							as: `timeTable`,
						},
					},
				])
				.toArray();
		}
		const classTeacher = await client.db(`RBMI`).collection(`classes`).findOne({
			classTeacher: user.username,
		});
		if (!classTeacher) {
			if (!accessAllowed.includes(user.access))
				throw new UserInputError(
					`No class Assigned !`,
					`You are not currently assigned as Class Teacher for any Class`
				);
			if (!id && !department)
				throw new UserInputError(
					`Insufficient data !`,
					`You must provide a class id or department to get details of`
				);
			// classTeacher = { _id: 0 };
		}
		const res = await client
			.db(`RBMI`)
			.collection(`classes`)
			.aggregate([
				{
					$match: {
						$or: [
							{
								_id: ObjectId(id) || ObjectId(classTeacher._id.toString()),
							},
							{
								department,
							},
						],
					},
				},
				{
					$addFields: { _id: { $toString: `$_id` } },
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
						from: `attendence`,
						localField: `_id`,
						foreignField: `class`,
						as: `attendence`,
					},
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `alias`,
						foreignField: `classRef`,
						as: `timeTable`,
					},
				},
			])
			.toArray();
		return res.map((el) => {
			return {
				...el,
				totalStudents: el.students.length,
			};
		});
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
