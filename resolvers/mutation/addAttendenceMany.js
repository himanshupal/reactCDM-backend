const { client, Error, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.addAttendenceMany = async (_, { data }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin`,
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
		else if (!data.class || !data.data)
			throw new Error(`Insufficient data !!!`, {
				error: `You must provide a class with data to update record of a class`,
			});
	}
	res = await connection
		.db(`RBMI`)
		.collection(`attendence`)
		.insertMany([
			...data.data.map((el) => {
				if (el.holiday && el.students)
					throw new Error(`It's holiday on ${el.day.date}`, {
						error: `Cannot add students on holiday`,
					});
				totalStudents = el.students ? el.students.length : 0;
				return {
					day: {
						date: el.day.date,
						month: el.day.month || new Date().getMonth(),
						year: el.day.year || new Date().getFullYear(),
					},
					class: data.class || res._id,
					holiday: el.holiday,
					students: el.students,
					totalStudents,
					createdAt: Date.now(),
					createdBy: user.username,
				};
			}),
		]);
	return res.insertedCount > 0
		? `Attendence of ${res.insertedCount} days successfully saved`
		: `There was some error saving data, please try again or contact admin !`;
};
