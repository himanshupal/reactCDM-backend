const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.addAttendenceBulk = async (_, { input }) => {
	user = CheckAuth(headers.authorization);
	if (
		user.access !==
		(`Head of Department` || `Assistant Professor` || `Associate Professor`)
	)
		throw new Error(`Access Denied !!!`, {
			error: `You don't have enough permissions to perform this operation !!!`,
		});
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`attendence`)
			.insertMany([
				...input.data.map((el) => {
					if (el.holiday && el.students)
						throw new Error(`It's holiday on ${el._id}`, {
							error: `Cannot add students on holiday`,
						});
					if (el.students) totalStudents = el.students.length;
					else totalStudents = 0;
					return {
						_id: `${el._id} ${input.class}`,
						class: input.class,
						holiday: el.holiday,
						students: el.students,
						totalStudents,
						createdAt: Date.now(),
						createdBy: user.username,
					};
				}),
			]);
		return res.insertedCount > 0
			? `Attendence of ${res.insertedCount} days saved successfully`
			: `There was some error saving data, please try again or contact admin ! `;
	} catch (error) {
		if (error.code === 11000)
			throw new Error(`Duplicate key Error !!!`, {
				error: `${error.keyValue._id} already exists in database, can't replace !`,
			});
		throw new Error(error);
	}
};
