const { client, Error, ObjectId, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getTeacher = async (_, { id }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access === `student`) throw new Forbidden(`Access Denied !!!`);
	if (user.access === (`Head of Department` || `Director`) && id) {
		res = await connection
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
		return res.map((teacher) => {
			return {
				...teacher,
				classTeacherOf:
					teacher.classTeacherOf.length > 0 ? teacher.classTeacherOf[0] : null,
			};
		});
	}
	res = await connection
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
	return res.map((teacher) => {
		return {
			...teacher,
			classTeacherOf:
				teacher.classTeacherOf.length > 0 ? teacher.classTeacherOf[0] : null,
		};
	});
};
