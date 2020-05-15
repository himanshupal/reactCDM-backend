const { client, Error, ObjectId } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getClass = async (_, { id, department }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access === `student`) {
		res = await connection.db(`RBMI`).collection(`students`).findOne({
			username: user.username,
		});
		return await connection
			.db(`RBMI`)
			.collection(`classes`)
			.aggregate([
				{
					$match: {
						_id: ObjectId(res.class),
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
	res = await connection.db(`RBMI`).collection(`classes`).findOne({
		classTeacher: user.username,
	});
	if (!res) {
		if (user.access !== (`Head of Department` || `Director`))
			throw new Error(`No class Assigned !!!`, {
				error: `It seems like you are not currently assigned as Class Teacher for any Class`,
			});
		else if (!id && !department)
			throw new Error(`Insufficient data !!!`, {
				error: `You must provide a class id or department to get details of`,
			});
		res = { _id: 0 };
	}
	res = await connection
		.db(`RBMI`)
		.collection(`classes`)
		.aggregate([
			{
				$match: {
					$or: [
						{
							_id: ObjectId(id) || ObjectId(res._id.toString()),
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
};
