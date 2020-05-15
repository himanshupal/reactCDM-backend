const { client, Error, ObjectId, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getAttendence = async (_, { id }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin !`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access === `student`) throw new Forbidden(`Access Denied !!!`);
	res = await connection.db(`RBMI`).collection(`classes`).findOne({
		classTeacher: user.username,
	});
	if (!res) {
		if (user.access !== (`Head of Department` || `Director`))
			throw new Error(`No class Assigned !!!`, {
				error: `It seems like you are not currently assigned as Class Teacher for any Class`,
			});
	}
	res = await connection
		.db(`RBMI`)
		.collection(`attendence`)
		.aggregate([
			{
				$match: {
					_id: ObjectId(id),
				},
			},
			{
				$lookup: {
					from: `students`,
					localField: `students`,
					foreignField: `_id`,
					as: `students`,
				},
			},
		])
		.toArray();
	return res[0];
};
