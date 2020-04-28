const { client } = require(`../../index`);

exports.addAttendence = async (_, { input }) => {
	if (input.holiday && input.students) throw new Error(`It's holiday...`);
	try {
		res = await (await client)
			.db(`RBMI`)
			.collection(`attendence`)
			.insertOne({
				...input,
				_id: `${input._id} ${input.class}`,
				totalStudents: input.students.length,
			});
		return res.insertedId;
	} catch (error) {
		throw new Error(error);
	}
};
