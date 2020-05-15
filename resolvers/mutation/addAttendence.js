const { client, Error, ObjectId, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.addAttendence = async (_, { data }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin !`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (
		user.access !==
		(`Head of Department` || `Assistant Professor` || `Associate Professor`)
	)
		throw new Forbidden(`Access Denied !!!`);
	if (data.holiday && data.students)
		throw new Error(`It's holiday...`, {
			error: `Cannot add students on holiday`,
		});
	res = await connection
		.db(`RBMI`)
		.collection(`attendence`)
		.findOne({ day: data.day, class: data.class });
	if (res)
		throw new Error(`Already exists...`, {
			error: `Attendence already taken by ${res.createdBy} at ${new Date(
				res.createdAt
			)
				.toLocaleTimeString("en-in", {
					weekday: "short",
					year: "numeric",
					month: "long",
					day: "numeric",
				})
				.replace(/,/g, ``)}`,
		});
	totalStudents = data.students ? data.students.length : 0;
	res = await connection
		.db(`RBMI`)
		.collection(`attendence`)
		.insertOne({
			...data,
			totalStudents,
			createdAt: Date.now(),
			createdBy: user.username,
		});
	return res.insertedId;
};
