const { client, Error } = require(`../../index`);

exports.addAttendence = async (_, { input }) => {
	if (input.holiday && input.students)
		throw new Error(`It's holiday...`, {
			error: `Cannot add students on holiday`,
		});
	try {
		if (input.students) totalStudents = input.students.length;
		else totalStudents = 0;
		res = await (await client)
			.db(`RBMI`)
			.collection(`attendence`)
			.insertOne({
				...input,
				_id: `${input._id} ${input.class}`,
				totalStudents,
			});
		return res.insertedCount > 0
			? `Saved successfully`
			: `There was some error saving data, please try again or contact admin ! `;
	} catch (error) {
		throw new Error(error);
	}
};
