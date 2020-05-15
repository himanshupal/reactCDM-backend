const { client, Error, ObjectId, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.updateAttendence = async (_, { id, data }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access === `student`) throw new Forbidden(`Access Denied !!!`);
	if (data.holiday && data.students)
		throw new Error(`It's holiday...`, {
			error: `Cannot add students on holiday`,
		});
	totalStudents = data.students ? data.students.length : 0;
	if (data.holiday) data.students = null;
	if (data.students) data.holiday = null;
	res = await connection
		.db(`RBMI`)
		.collection(`attendence`)
		.updateOne(
			{
				_id: ObjectId(id),
			},
			{
				$set: {
					...data,
					totalStudents,
					lastUpdated: Date.now(),
					lastUpdatedBy: user.username,
				},
			}
		);
	return res.modifiedCount > 0
		? `Attendence updated !`
		: `Error saving data. Please try again or contact admin if issue persists`;
};
