const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.addAttendence = async (_, { input }) => {
	user = CheckAuth(headers.authorization);
	if (
		user.access !==
		(`Head of Department` || `Assistant Professor` || `Associate Professor`)
	)
		throw new Error(`Access Denied !!!`, {
			error: `You don't have enough permissions to perform this operation !!!`,
		});
	if (input.holiday && input.students)
		throw new Error(`It's holiday...`, {
			error: `Cannot add students on holiday`,
		});
	try {
		if (input.students) totalStudents = input.students.length;
		else totalStudents = 0;
		const res = await (await client)
			.db(`RBMI`)
			.collection(`attendence`)
			.insertOne({
				...input,
				_id: `${input._id} ${input.class}`,
				totalStudents,
				createdAt: Date.now(),
				createdBy: user.username,
			});
		return res.insertedCount > 0
			? `Saved successfully`
			: `There was some error saving data, please try again or contact admin ! `;
	} catch (error) {
		if (error.code === 11000)
			throw new Error(`Duplicate key Error !!!`, {
				error: `${error.keyValue._id} already exists in database, can't replace !`,
			});
		throw new Error(error);
	}
};
