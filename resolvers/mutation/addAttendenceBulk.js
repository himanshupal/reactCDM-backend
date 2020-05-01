const { client, Error } = require(`../../index`);

exports.addAttendenceBulk = async (_, { input }) => {
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
