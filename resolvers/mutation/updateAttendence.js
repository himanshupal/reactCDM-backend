const { client, Error } = require(`../../index`);

exports.updateAttendence = async (_, { input }) => {
	if (!input._id && !input.class)
		throw new Error(`Argument missing...`, {
			error: `You must provide a date & class separated with space to update attendence !!!`,
		});
	if (input.holiday && input.students)
		throw new Error(`It's holiday...`, {
			error: `Cannot add students on holiday`,
		});
	try {
		if (input.students) totalStudents = input.students.length;
		else totalStudents = 0;
		if (input.holiday) input.students = null;
		const res = await (await client)
			.db(`RBMI`)
			.collection(`attendence`)
			.updateMany(
				{
					_id: input._id,
				},
				{
					$set: {
						...input,
						totalStudents,
						lastUpdated: Date.now(),
					},
				}
			);
		return res.modifiedCount > 0
			? `Record updated !`
			: `No record found matching given arguments...`;
	} catch (error) {
		throw new Error(error);
	}
};
