const { client, Error, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getFullMonthAttendence = async (
	_,
	{ month, year, class: clas },
	{ headers }
) => {
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
		else if (!clas)
			throw new Error(`Insufficient data !!!`, {
				error: `You must provide a class to get attendence of`,
			});
	}
	return await connection
		.db(`RBMI`)
		.collection(`attendence`)
		.aggregate([
			{
				$match: {
					"day.month": month || new Date().getMonth(),
					"day.year": year || new Date().getFullYear(),
					class: clas || res._id.toString(),
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
};
